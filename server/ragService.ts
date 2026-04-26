import { supabase } from './supabaseClient';
import dotenv from 'dotenv';

dotenv.config();

// 文本分块配置
const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 128;
const EMBEDDING_DIMENSION = 768;

export interface KnowledgeDocument {
  id?: string;
  title: string;
  content: string;
  source?: string;
  category?: string;
  tags?: string[];
  sceneId?: string;
}

export interface SearchResult {
  id: string;
  chunkText: string;
  documentId: string;
  title: string;
  source: string;
  similarity: number;
  metadata: any;
}

/**
 * 将文本分割成小块
 */
export function splitTextIntoChunks(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^。！？.!?]+[。！？.!?]+/g) || [text];
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // 保留重叠部分
      const words = currentChunk.split('');
      currentChunk = words.slice(Math.max(0, words.length - overlap)).join('') + sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function hashToken(token: string) {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * 使用本地哈希向量生成检索特征。
 * 比赛要求所有大模型接口统一使用 DeepSeek，因此 RAG 检索不再调用外部 embedding 模型。
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  const tokens = text
    .toLowerCase()
    .match(/[\p{Script=Han}]|[a-z0-9]+/gu) || [];

  for (const token of tokens) {
    const hash = hashToken(token);
    const index = hash % EMBEDDING_DIMENSION;
    vector[index] += (hash & 1) === 0 ? 1 : -1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map(value => value / norm);
}

/**
 * 创建知识文档并分块存储
 */
export async function createKnowledgeDocument(doc: KnowledgeDocument): Promise<string> {
  try {
    // 1. 创建文档记录
    const { data: document, error: docError } = await supabase
      .from('knowledge_documents')
      .insert([{
        title: doc.title,
        content: doc.content,
        source: doc.source,
        category: doc.category,
        tags: doc.tags || [],
        scene_id: doc.sceneId
      }])
      .select()
      .single();

    if (docError) throw docError;
    if (!document) throw new Error('Failed to create document');

    // 2. 分块
    const chunks = splitTextIntoChunks(doc.content);

    // 3. 为每个块生成向量并存储
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await generateEmbedding(chunkText);

      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert([{
          document_id: document.id,
          chunk_text: chunkText,
          chunk_index: i,
          embedding: embedding,
          metadata: {
            documentTitle: doc.title,
            chunkPosition: `${i + 1}/${chunks.length}`,
            category: doc.category,
            source: doc.source
          }
        }]);

      if (chunkError) throw chunkError;
    }

    console.log(`Created knowledge document: ${doc.title} with ${chunks.length} chunks`);
    return document.id;
  } catch (err) {
    console.error('Error creating knowledge document:', err);
    throw err;
  }
}

/**
 * 向量相似度搜索
 */
export async function searchSimilarChunks(
  query: string,
  options: {
    topK?: number;
    sceneId?: string;
    category?: string;
    threshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const { topK = 5, sceneId, category, threshold = 0.7 } = options;

  try {
    // 1. 生成查询向量
    const queryEmbedding = await generateEmbedding(query);

    // 2. 执行向量相似度搜索
    let queryBuilder = supabase
      .rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: topK
      });

    const { data, error } = await queryBuilder;

    if (error) {
      // 如果 RPC 不存在，使用替代方法
      console.log('RPC not found, using fallback search method');
      return fallbackSearch(queryEmbedding, topK, threshold, sceneId, category);
    }

    // 3. 格式化结果
    const results: SearchResult[] = data.map((item: any) => ({
      id: item.id,
      chunkText: item.chunk_text,
      documentId: item.document_id,
      title: item.title || 'Unknown',
      source: item.source || '',
      similarity: item.similarity,
      metadata: item.metadata || {}
    }));

    return results;
  } catch (err) {
    console.error('Error searching similar chunks:', err);
    return [];
  }
}

/**
 * 备用搜索方法（当 RPC 不存在时使用）
 */
async function fallbackSearch(
  queryEmbedding: number[],
  topK: number,
  threshold: number,
  sceneId?: string,
  category?: string
): Promise<SearchResult[]> {
  try {
    // 获取所有 chunks（实际生产环境应该使用分页或 RPC）
    let query = supabase
      .from('knowledge_chunks')
      .select(`
        id,
        chunk_text,
        document_id,
        embedding,
        metadata,
        knowledge_documents!inner(title, source, scene_id, category)
      `);

    if (sceneId) {
      query = query.eq('knowledge_documents.scene_id', sceneId);
    }

    if (category) {
      query = query.eq('knowledge_documents.category', category);
    }

    const { data, error } = await query.limit(1000);

    if (error || !data) {
      console.error('Fallback search error:', error);
      return [];
    }

    // 计算余弦相似度
    const results = data.map((chunk: any) => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        id: chunk.id,
        chunkText: chunk.chunk_text,
        documentId: chunk.document_id,
        title: chunk.knowledge_documents?.title || 'Unknown',
        source: chunk.knowledge_documents?.source || '',
        similarity,
        metadata: chunk.metadata
      };
    });

    // 按相似度排序并过滤
    return results
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (err) {
    console.error('Fallback search error:', err);
    return [];
  }
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 构建 RAG 增强的提示词
 */
export function buildRAGPrompt(query: string, searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return query;
  }

  const contextParts = searchResults.map((result, index) => {
    return `[${index + 1}] ${result.title}${result.source ? ` (来源: ${result.source})` : ''}:\n${result.chunkText}`;
  });

  const ragPrompt = `基于以下历史资料回答用户的问题。请优先使用参考资料中的信息，如果资料不足，可以结合你的历史知识进行回答。

## 参考资料

${contextParts.join('\n\n')}

## 用户问题

${query}

请基于以上资料提供准确、详细的回答。`;

  return ragPrompt;
}

/**
 * 删除知识文档
 */
export async function deleteKnowledgeDocument(documentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
    console.log(`Deleted knowledge document: ${documentId}`);
  } catch (err) {
    console.error('Error deleting knowledge document:', err);
    throw err;
  }
}

/**
 * 获取知识文档列表
 */
export async function listKnowledgeDocuments(options: {
  category?: string;
  sceneId?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<any[]> {
  const { category, sceneId, limit = 20, offset = 0 } = options;

  try {
    let query = supabase
      .from('knowledge_documents')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error listing knowledge documents:', err);
    return [];
  }
}

/**
 * 批量导入历史知识
 */
export async function batchImportKnowledge(documents: KnowledgeDocument[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const doc of documents) {
    try {
      await createKnowledgeDocument(doc);
      success++;
    } catch (err) {
      console.error(`Failed to import document: ${doc.title}`, err);
      failed++;
    }
  }

  console.log(`Batch import complete: ${success} success, ${failed} failed`);
  return { success, failed };
}
