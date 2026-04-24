import express from 'express';
import { chatWithHistoricalFigure, generateSceneDescription, generateDynamicQuiz, analyzePersonaLog, generateStoryNodeContent, generateChoiceConsequence, generateEndingSummary } from './aiService';
import { supabase } from './supabaseClient';
import { sendReportEmail } from './emailService';
import { sendReportToDingTalk } from './dingtalkService';
import { authenticateToken } from './auth';
import {
  createKnowledgeDocument,
  searchSimilarChunks,
  listKnowledgeDocuments,
  deleteKnowledgeDocument,
  batchImportKnowledge
} from './ragService';
import { getSceneScript } from './storyService';

const router = express.Router();

router.use((req: any, res, next) => authenticateToken(req, res, next));

router.post('/chat', async (req: any, res) => {
  const { npcId, sceneId, history, message, useRAG } = req.body;
  try {
    const text = await chatWithHistoricalFigure(npcId, sceneId, history || [], message, { useRAG });
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.post('/scene-description', async (req: any, res) => {
  const { sceneId } = req.body;
  try {
    const text = await generateSceneDescription(sceneId);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.post('/generate-quiz', async (req: any, res) => {
  const { sceneId } = req.body;
  const userId = req.user.id;
  try {
    const { data } = await supabase.from('learning_logs').select('*').eq('user_id', userId).eq('scene_id', sceneId);
    let logs: string[] = data ? data.map((l: any) => l.log_text) : [];

    const questions = await generateDynamicQuiz(sceneId, logs);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.post('/report', async (req: any, res) => {
  const userId = req.user.id;
  try {
    const { data } = await supabase.from('learning_logs').select('*').eq('user_id', userId);
    let logs: string[] = data ? data.map((l: any) => l.log_text) : [];
    
    const profile = await analyzePersonaLog(logs);
    
    await supabase.from('persona_profiles').upsert({
      user_id: userId,
      strategic: profile.strategic,
      empathy: profile.empathy,
      people_oriented: profile.people_oriented,
      meticulousness: profile.meticulousness,
      pragmatic: profile.pragmatic,
      ai_comments: profile.ai_comments,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.post('/log', async (req: any, res) => {
  const { sceneId, text } = req.body;
  const userId = req.user.id;
  try {
    await supabase.from('learning_logs').insert([{ user_id: userId, scene_id: sceneId, log_text: text }]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.post('/send-email', async (req: any, res) => {
  const { email, reportData } = req.body;
  try {
    const info = await sendReportEmail(email, reportData);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// 发送学习报告到钉钉群
router.post('/send-dingtalk', async (req: any, res) => {
  const { reportData } = req.body;
  const userId = req.user.id;

  try {
    // 获取用户信息
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    // 获取学习记录
    const { data: learnedData } = await supabase
      .from('learning_logs')
      .select('scene_id')
      .eq('user_id', userId);

    const learnedNodes = learnedData ? [...new Set(learnedData.map((l: any) => l.scene_id))].length : 0;

    // 发送到钉钉
    await sendReportToDingTalk({
      userName: userData?.name || reportData.userName || '学员',
      strategic: reportData.strategic || 50,
      empathy: reportData.empathy || 50,
      people_oriented: reportData.people_oriented || 50,
      meticulousness: reportData.meticulousness || 50,
      pragmatic: reportData.pragmatic || 50,
      ai_comments: reportData.ai_comments || '',
      learnedNodes,
      totalNodes: 6,
      accuracy: reportData.accuracy || 0
    });

    res.json({ success: true, message: '报告已发送到钉钉群' });
  } catch (err) {
    console.error('钉钉发送错误:', err);
    res.status(500).json({ error: (err as any).message });
  }
});

// ==================== RAG 知识库管理 API ====================

// 创建知识文档
router.post('/knowledge/documents', async (req: any, res) => {
  try {
    const { title, content, source, category, tags, sceneId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const documentId = await createKnowledgeDocument({
      title,
      content,
      source,
      category,
      tags,
      sceneId
    });

    res.json({ 
      success: true, 
      documentId,
      message: '知识文档创建成功' 
    });
  } catch (err: any) {
    console.error('Create knowledge document error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 批量导入知识文档
router.post('/knowledge/batch-import', async (req: any, res) => {
  try {
    const { documents } = req.body;
    
    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: '请提供文档数组' });
    }

    const result = await batchImportKnowledge(documents);

    res.json({ 
      success: true, 
      ...result,
      message: `批量导入完成：${result.success} 成功, ${result.failed} 失败`
    });
  } catch (err: any) {
    console.error('Batch import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 搜索知识库
router.post('/knowledge/search', async (req: any, res) => {
  try {
    const { query, topK, sceneId, category, threshold } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: '查询内容不能为空' });
    }

    const results = await searchSimilarChunks(query, {
      topK: topK || 5,
      sceneId,
      category,
      threshold: threshold || 0.7
    });

    res.json({ 
      success: true, 
      query,
      count: results.length,
      results 
    });
  } catch (err: any) {
    console.error('Knowledge search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取知识文档列表
router.get('/knowledge/documents', async (req: any, res) => {
  try {
    const { category, sceneId, limit, offset } = req.query;

    const documents = await listKnowledgeDocuments({
      category,
      sceneId,
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.json({ 
      success: true, 
      count: documents.length,
      documents 
    });
  } catch (err: any) {
    console.error('List documents error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 删除知识文档
router.delete('/knowledge/documents/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    await deleteKnowledgeDocument(id);

    res.json({ 
      success: true, 
      message: '知识文档删除成功' 
    });
  } catch (err: any) {
    console.error('Delete document error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取知识文档详情（包括分块）
router.get('/knowledge/documents/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // 获取文档信息
    const { data: document, error: docError } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return res.status(404).json({ error: '文档不存在' });
    }

    // 获取文档的分块
    const { data: chunks, error: chunkError } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_text, chunk_index, metadata, created_at')
      .eq('document_id', id)
      .order('chunk_index', { ascending: true });

    if (chunkError) {
      return res.status(500).json({ error: '获取分块失败' });
    }

    res.json({
      success: true,
      document: {
        ...document,
        chunks: chunks || []
      }
    });
  } catch (err: any) {
    console.error('Get document detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== 场景剧情 API ====================

// 获取场景剧本
router.get('/story/script/:sceneId', (req: any, res) => {
  const { sceneId } = req.params;
  try {
    const script = getSceneScript(sceneId);
    if (!script) {
      return res.status(404).json({ error: '场景不存在' });
    }
    res.json({ success: true, script });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 开始场景剧情
router.post('/story/start', async (req: any, res) => {
  const { sceneId } = req.body;
  const userId = req.user.id;

  try {
    const script = getSceneScript(sceneId);
    if (!script) {
      return res.status(404).json({ error: '场景不存在' });
    }

    const startNode = script.nodes.find(n => n.id === script.startNodeId);
    if (!startNode) {
      return res.status(500).json({ error: '剧本配置错误' });
    }

    // 记录开始日志
    await supabase.from('learning_logs').insert([{
      user_id: userId,
      scene_id: sceneId,
      log_text: `[剧情开始] 进入场景：${script.title}`
    }]);

    // 直接使用预定义内容（不调用 AI）
    res.json({
      success: true,
      node: startNode,
      progress: {
        sceneId,
        currentNodeId: startNode.id,
        visitedNodes: [startNode.id],
        choices: [],
        personalityAccumulator: {
          strategic: 0,
          empathy: 0,
          people_oriented: 0,
          meticulousness: 0,
          pragmatic: 0
        }
      }
    });
  } catch (err: any) {
    console.error('Start story error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 处理用户选择
router.post('/story/choose', async (req: any, res) => {
  const { sceneId, nodeId, choiceId, previousChoices, personalityAccumulator } = req.body;
  const userId = req.user.id;

  try {
    const script = getSceneScript(sceneId);
    if (!script) {
      return res.status(404).json({ error: '场景不存在' });
    }

    const currentNode = script.nodes.find(n => n.id === nodeId);
    if (!currentNode) {
      return res.status(404).json({ error: '节点不存在' });
    }

    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) {
      return res.status(400).json({ error: '无效的选择' });
    }

    // 记录选择日志
    await supabase.from('learning_logs').insert([{
      user_id: userId,
      scene_id: sceneId,
      log_text: `[选择] ${choice.text}`
    }]);

    // 更新人格积累
    const newAccumulator = { ...personalityAccumulator };
    if (choice.personalityImpact) {
      Object.keys(choice.personalityImpact).forEach(key => {
        newAccumulator[key] = (newAccumulator[key] || 0) + (choice.personalityImpact[key] || 0);
      });
    }

    // 获取下一个节点
    const nextNode = script.nodes.find(n => n.id === choice.nextNodeId);
    if (!nextNode) {
      return res.status(500).json({ error: '剧本分支错误' });
    }

    // 直接使用预定义内容（不调用 AI）
    // 记录完成日志
    if (nextNode.nodeType === 'ending') {
      await supabase.from('learning_logs').insert([{
        user_id: userId,
        scene_id: sceneId,
        log_text: `[剧情结束] ${nextNode.endingType === 'success' ? '任务成功' : nextNode.endingType === 'partial' ? '部分成功' : '任务失败'}`
      }]);
    }

    res.json({
      success: true,
      node: nextNode,
      consequence: '',
      endingSummary: '',
      choice,
      progress: {
        sceneId,
        currentNodeId: nextNode.id,
        visitedNodes: [...(previousChoices ? [nodeId] : [nodeId])],
        choices: [...(previousChoices?.map((_: any, i: number) => ({ nodeId, choiceId })) || []), { nodeId, choiceId }],
        personalityAccumulator: newAccumulator
      }
    });
  } catch (err: any) {
    console.error('Choose error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 继续到下一个节点（用于叙述节点）
router.post('/story/continue', async (req: any, res) => {
  const { sceneId, nodeId, previousChoices } = req.body;

  try {
    const script = getSceneScript(sceneId);
    if (!script) {
      return res.status(404).json({ error: '场景不存在' });
    }

    const currentNode = script.nodes.find(n => n.id === nodeId);
    if (!currentNode) {
      return res.status(404).json({ error: '节点不存在' });
    }

    // 如果当前节点有选择，返回当前节点（让用户选择）
    if (currentNode.choices && currentNode.choices.length > 0) {
      return res.json({
        success: true,
        node: currentNode,
        requiresChoice: true
      });
    }

    // 叙述节点：找到下一个节点（按节点顺序）
    const currentIndex = script.nodes.findIndex(n => n.id === nodeId);
    const nextNode = script.nodes[currentIndex + 1];

    if (!nextNode) {
      return res.status(404).json({ error: '没有更多节点' });
    }

    // 直接使用预定义内容（不调用 AI）
    res.json({
      success: true,
      node: nextNode,
      requiresChoice: !!(nextNode.choices && nextNode.choices.length > 0),
      progress: {
        sceneId,
        currentNodeId: nextNode.id,
        visitedNodes: [nodeId, nextNode.id],
        choices: [],
        personalityAccumulator: {
          strategic: 0,
          empathy: 0,
          people_oriented: 0,
          meticulousness: 0,
          pragmatic: 0
        }
      }
    });
  } catch (err: any) {
    console.error('Continue error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
