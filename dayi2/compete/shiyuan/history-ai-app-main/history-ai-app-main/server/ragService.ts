import { supabase } from './supabaseClient';
import dotenv from 'dotenv';

dotenv.config();

// 文本分块配置
const CHUNK_SIZE_MIN = 300;
const CHUNK_SIZE_MAX = 600;
const CHUNK_OVERLAP = 100;
const EMBEDDING_DIMENSION = 768;

// RAG 缓存配置
interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

const RAG_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = parseInt(process.env.RAG_CACHE_TTL_MS || '300000'); // 5分钟默认
const CACHE_MAX_SIZE = 200;

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
  score?: number;
}

export interface RAGSearchOptions {
  topK?: number;
  sceneId?: string;
  category?: string;
  threshold?: number;
  useCache?: boolean;
  useHybridSearch?: boolean;
  expandQuery?: boolean;
}

// 历史名词映射表，用于查询扩展
const HISTORICAL_SYNONYMS: Record<string, string[]> = {
  '七七事变': ['卢沟桥事变', '卢沟桥', '七七', '1937年7月7日'],
  '卢沟桥事变': ['七七事变', '卢沟桥', '七七', '1937年7月7日'],
  '台儿庄大捷': ['台儿庄战役', '台儿庄', '鲁南会战'],
  '抗战胜利': ['日本投降', '抗战结束', '1945年8月15日'],
  '重庆谈判': ['双十协定', '国共谈判', '1945年重庆'],
  '淮海战役': ['徐蚌会战', '三大战役', '1948年11月'],
  '开国大典': ['新中国成立', '1949年10月1日', '中华人民共和国成立'],
  '佟麟阁': ['第29军副军长', '南苑战斗', '抗日英烈'],
  '赵登禹': ['大刀队', '喜峰口', '抗日英烈'],
  '张自忠': ['枣宜会战', '第33集团军', '抗日名将'],
  '李宗仁': ['台儿庄', '第五战区', '桂系'],
  '毛泽东': ['论持久战', '延安', '中共中央主席'],
  '周恩来': ['重庆谈判', '双十协定', '和平谈判']
};

function expandQueryTerms(query: string): string {
  let expandedQuery = query;
  
  for (const [term, synonyms] of Object.entries(HISTORICAL_SYNONYMS)) {
    if (query.includes(term)) {
      const relevantSynonyms = synonyms.filter(s => !query.includes(s));
      if (relevantSynonyms.length > 0) {
        expandedQuery += ' ' + relevantSynonyms.slice(0, 3).join(' ');
      }
    }
    for (const synonym of synonyms) {
      if (query.includes(synonym) && !query.includes(term)) {
        expandedQuery += ' ' + term;
        break;
      }
    }
  }
  
  return expandedQuery;
}

export interface RAGSearchResult {
  results: SearchResult[];
  queryExpanded: string;
  cacheHit: boolean;
  searchMethod: string;
  retrievalTime: number;
}

function hashToken(token: string) {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function generateCacheKey(query: string, options: RAGSearchOptions): string {
  return `${query}:${options.sceneId || ''}:${options.category || ''}:${options.topK || 5}`;
}

function getFromCache(key: string): SearchResult[] | null {
  const entry = RAG_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    RAG_CACHE.delete(key);
    return null;
  }
  return entry.results;
}

function setCache(key: string, results: SearchResult[]): void {
  if (RAG_CACHE.size >= CACHE_MAX_SIZE) {
    const oldestKey = RAG_CACHE.keys().next().value;
    if (oldestKey) {
      RAG_CACHE.delete(oldestKey);
    }
  }
  RAG_CACHE.set(key, { results, timestamp: Date.now() });
}

export function splitTextIntoChunks(text: string, chunkSize: number = CHUNK_SIZE_MAX, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  
  const paragraphs = text.split(/\n+/).filter(p => p.trim());
  
  if (paragraphs.length > 1) {
    return splitByParagraphs(paragraphs, chunkSize, overlap);
  }
  
  const sentences = text.match(/[^。！？.!?]+[。！？.!?]+/g) || [text];
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length >= CHUNK_SIZE_MIN) {
      chunks.push(currentChunk.trim());
      const overlapStart = Math.max(0, currentChunk.length - overlap);
      currentChunk = currentChunk.slice(overlapStart) + sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function splitByParagraphs(paragraphs: string[], chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > chunkSize && currentChunk.length >= CHUNK_SIZE_MIN) {
      chunks.push(currentChunk.trim());
      const overlapStart = Math.max(0, currentChunk.length - overlap);
      currentChunk = currentChunk.slice(overlapStart) + '\n' + para;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  
  const tokens = text
    .toLowerCase()
    .match(/[\p{Script=Han}]|[a-z0-9]+/gu) || [];

  const tokenWeights = new Map<string, number>();
  for (const token of tokens) {
    tokenWeights.set(token, (tokenWeights.get(token) || 0) + 1);
  }

  const totalTokens = tokens.length;
  for (const [token, count] of tokenWeights.entries()) {
    const hash = hashToken(token);
    const index = hash % EMBEDDING_DIMENSION;
    const weight = (count / totalTokens) * Math.log2(count + 1);
    vector[index] += ((hash & 1) === 0 ? 1 : -1) * weight;
    
    const bigramIndex = (hash >> 8) % EMBEDDING_DIMENSION;
    vector[bigramIndex] += ((hash & 3) === 0 ? 0.5 : -0.5) * weight;
    
    const trigramIndex = (hash >> 16) % EMBEDDING_DIMENSION;
    vector[trigramIndex] += ((hash & 7) === 0 ? 0.3 : -0.3) * weight;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map(value => value / norm);
}

export async function createKnowledgeDocument(doc: KnowledgeDocument): Promise<string> {
  try {
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

    const chunks = splitTextIntoChunks(doc.content);

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
            source: doc.source,
            sceneId: doc.sceneId,
            tags: doc.tags || []
          }
        }]);

      if (chunkError) throw chunkError;
    }

    console.log(`[RAG] Created knowledge document: ${doc.title} with ${chunks.length} chunks`);
    return document.id;
  } catch (err) {
    console.error('[RAG] Error creating knowledge document:', err);
    throw err;
  }
}

export async function searchSimilarChunks(
  query: string,
  options: RAGSearchOptions = {}
): Promise<SearchResult[]> {
  const startTime = Date.now();
  const { 
    topK = 5, 
    sceneId, 
    category, 
    threshold = 0.6,
    useCache = true,
    useHybridSearch = true,
    expandQuery = true
  } = options;

  let effectiveQuery = query;
  if (expandQuery) {
    effectiveQuery = expandQueryTerms(query);
    if (effectiveQuery !== query) {
      console.log(`[RAG] Query expanded: "${query}" -> "${effectiveQuery}"`);
    }
  }

  const cacheKey = generateCacheKey(effectiveQuery, options);
  
  if (useCache) {
    const cachedResults = getFromCache(cacheKey);
    if (cachedResults) {
      console.log(`[RAG] Cache hit for query: ${query.substring(0, 30)}...`);
      return cachedResults;
    }
  }

  let results: SearchResult[];
  if (useHybridSearch) {
    results = await hybridSearch(effectiveQuery, topK, threshold, sceneId, category);
  } else {
    results = await vectorSearch(effectiveQuery, topK, threshold, sceneId, category);
  }
  
  if (useCache) {
    setCache(cacheKey, results);
  }
  console.log(`[RAG] Search completed in ${Date.now() - startTime}ms, found ${results.length} results`);
  return results;
}

async function vectorSearch(
  query: string,
  topK: number,
  threshold: number,
  sceneId?: string,
  category?: string
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    let queryBuilder = supabase
      .rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: topK
      });

    const { data, error } = await queryBuilder;

    if (error) {
      console.log('[RAG] RPC not found, using fallback search method');
      return fallbackSearch(queryEmbedding, topK, threshold, sceneId, category);
    }

    const results: SearchResult[] = data.map((item: any) => ({
      id: item.id,
      chunkText: item.chunk_text,
      documentId: item.document_id,
      title: item.title || 'Unknown',
      source: item.source || '',
      similarity: item.similarity,
      metadata: item.metadata || {},
      score: item.similarity
    }));

    return results;
  } catch (err) {
    console.error('[RAG] Error in vector search:', err);
    return [];
  }
}

async function hybridSearch(
  query: string,
  topK: number,
  threshold: number,
  sceneId?: string,
  category?: string
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const vectorResults = await vectorSearch(query, topK * 2, threshold * 0.8, sceneId, category);
    
    const keywordResults = await keywordSearch(query, topK * 2, sceneId, category);

    const allResults = [...vectorResults, ...keywordResults];
    
    const uniqueResults = deduplicateResults(allResults);

    const rerankedResults = rerankResults(uniqueResults, query);

    const filteredResults = rerankedResults
      .filter(r => r.similarity >= threshold || r.score! >= threshold)
      .slice(0, topK);

    console.log(`[RAG] Hybrid search: ${vectorResults.length} vector + ${keywordResults.length} keyword = ${filteredResults.length} final`);
    
    return filteredResults;
  } catch (err) {
    console.error('[RAG] Hybrid search error, falling back to vector search:', err);
    return vectorSearch(query, topK, threshold, sceneId, category);
  }
}

async function keywordSearch(
  query: string,
  topK: number,
  sceneId?: string,
  category?: string
): Promise<SearchResult[]> {
  try {
    const keywords = extractKeywords(query);
    
    if (keywords.length === 0) return [];

    let queryBuilder = supabase
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
      queryBuilder = queryBuilder.eq('knowledge_documents.scene_id', sceneId);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('knowledge_documents.category', category);
    }

    const { data, error } = await queryBuilder.limit(500);

    if (error || !data) {
      console.error('[RAG] Keyword search error:', error);
      return [];
    }

    const results = data.map((chunk: any) => {
      const chunkText = chunk.chunk_text.toLowerCase();
      let matchScore = 0;
      let matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase();
        const regex = new RegExp(keywordLower, 'g');
        const matches = chunkText.match(regex);
        if (matches) {
          matchScore += matches.length * (keyword.length > 2 ? 2 : 1);
          matchedKeywords.push(keyword);
        }
      }

      const title = chunk.knowledge_documents?.title || '';
      const titleLower = title.toLowerCase();
      for (const keyword of keywords) {
        if (titleLower.includes(keyword.toLowerCase())) {
          matchScore += 5;
        }
      }

      return {
        id: chunk.id,
        chunkText: chunk.chunk_text,
        documentId: chunk.document_id,
        title: title,
        source: chunk.knowledge_documents?.source || '',
        similarity: Math.min(matchScore / (keywords.length * 3), 1),
        metadata: chunk.metadata,
        score: matchScore,
        matchedKeywords
      };
    });

    return results
      .filter(r => r.matchedKeywords && r.matchedKeywords.length > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  } catch (err) {
    console.error('[RAG] Keyword search error:', err);
    return [];
  }
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '他', '她', '它', '们', '那', '什么', '怎么', '为什么', '吗', '呢',
    '请', '问', '想', '能', '可以', '让', '给', '被', '把', '从', '向', '对', '关于',
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to',
    'for', 'of', 'it', 'this', 'that', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'what', 'who', 'when', 'where', 'why', 'how'
  ]);

  const tokens = text.match(/[\p{Script=Han}]{2,}|[a-z]{3,}/gu) || [];
  
  const keywords = tokens.filter(token => !stopWords.has(token.toLowerCase()));
  
  return [...new Set(keywords)].slice(0, 10);
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>();
  
  for (const result of results) {
    const existing = seen.get(result.id);
    if (!existing) {
      seen.set(result.id, { ...result });
    } else {
      existing.similarity = Math.max(existing.similarity, result.similarity);
      existing.score = Math.max(existing.score || 0, result.score || 0);
      if ((result as any).matchedKeywords) {
        (existing as any).matchedKeywords = [
          ...new Set([...((existing as any).matchedKeywords || []), ...((result as any).matchedKeywords || [])])
        ];
      }
    }
  }
  
  return Array.from(seen.values());
}

function rerankResults(results: SearchResult[], query: string): SearchResult[] {
  const queryKeywords = extractKeywords(query);
  
  const reranked = results.map(result => {
    let boost = 0;
    
    const chunkText = result.chunkText.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (chunkText.includes(queryLower)) {
      boost += 0.2;
    }
    
    for (const keyword of queryKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (chunkText.includes(keywordLower)) {
        boost += 0.05;
      }
    }
    
    if (result.title.toLowerCase().includes(queryLower)) {
      boost += 0.15;
    }
    
    const finalScore = result.similarity * 0.6 + (result.score || 0) * 0.4 + boost;
    
    return {
      ...result,
      similarity: Math.min(result.similarity + boost, 1),
      score: finalScore
    };
  });
  
  return reranked.sort((a, b) => (b.score || b.similarity) - (a.score || a.similarity));
}

async function fallbackSearch(
  queryEmbedding: number[],
  topK: number,
  threshold: number,
  sceneId?: string,
  category?: string
): Promise<SearchResult[]> {
  try {
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
      console.error('[RAG] Fallback search error:', error);
      return [];
    }

    const results = data.map((chunk: any) => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        id: chunk.id,
        chunkText: chunk.chunk_text,
        documentId: chunk.document_id,
        title: chunk.knowledge_documents?.title || 'Unknown',
        source: chunk.knowledge_documents?.source || '',
        similarity,
        metadata: chunk.metadata,
        score: similarity
      };
    });

    return results
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (err) {
    console.error('[RAG] Fallback search error:', err);
    return [];
  }
}

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

export function buildRAGPrompt(query: string, searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return query;
  }

  const contextParts = searchResults.map((result, index) => {
    const sourceInfo = result.source ? `（来源：${result.source}）` : '';
    const confidence = result.similarity > 0.8 ? '高相关' : result.similarity > 0.6 ? '中等相关' : '低相关';
    return `【参考资料 ${index + 1}】${result.title} ${sourceInfo} [相关度：${confidence}]\n${result.chunkText}`;
  });

  const ragPrompt = `## 历史参考资料

以下是与用户问题相关的历史资料，请优先使用这些资料中的信息进行回答：

${contextParts.join('\n\n---\n\n')}

---

## 用户问题

${query}

## 回答要求

1. 优先使用上述参考资料中的准确历史信息
2. 如果资料不足，可以结合你的历史知识进行补充
3. 保持回答的准确性、客观性和教育性
4. 如果参考资料与你的知识有冲突，以参考资料为准
5. 在回答中适当引用资料来源

请基于以上资料提供准确、详细的回答。`;

  return ragPrompt;
}

export function buildRAGContextForDialogue(
  query: string,
  searchResults: SearchResult[],
  npcName?: string,
  sceneContext?: string
): string {
  if (searchResults.length === 0) {
    return '';
  }

  const contextParts = searchResults.map((result, index) => {
    return `[资料${index + 1}] ${result.title}${result.source ? ` (来源: ${result.source})` : ''}:\n${result.chunkText}`;
  });

  let context = `\n## 历史参考资料（供你参考，用于提供准确的历史信息）\n\n`;
  context += contextParts.join('\n\n');
  
  if (sceneContext) {
    context += `\n\n## 当前场景背景\n${sceneContext}`;
  }

  return context;
}

export async function deleteKnowledgeDocument(documentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
    console.log(`[RAG] Deleted knowledge document: ${documentId}`);
    
    clearCache();
  } catch (err) {
    console.error('[RAG] Error deleting knowledge document:', err);
    throw err;
  }
}

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
    console.error('[RAG] Error listing knowledge documents:', err);
    return [];
  }
}

export async function batchImportKnowledge(documents: KnowledgeDocument[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const doc of documents) {
    try {
      await createKnowledgeDocument(doc);
      success++;
    } catch (err) {
      console.error(`[RAG] Failed to import document: ${doc.title}`, err);
      failed++;
    }
  }

  console.log(`[RAG] Batch import complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

export function getRAGStats(): { cacheSize: number; cacheHitRate: string } {
  return {
    cacheSize: RAG_CACHE.size,
    cacheHitRate: 'N/A'
  };
}

export function clearCache(): void {
  RAG_CACHE.clear();
  console.log('[RAG] Cache cleared');
}
