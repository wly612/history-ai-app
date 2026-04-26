import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
// We can import types from the frontend
import { NPCS, HISTORICAL_NODES } from '../src/types';
import { searchSimilarChunks, buildRAGPrompt } from './ragService';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// RAG 配置
const RAG_ENABLED = process.env.RAG_ENABLED === 'true';
const RAG_TOP_K = parseInt(process.env.RAG_TOP_K || '5');
const RAG_THRESHOLD = parseFloat(process.env.RAG_THRESHOLD || '0.7');

export async function chatWithHistoricalFigure(
  npcId: string, 
  sceneId: string, 
  history: any[], 
  message: string,
  options: { useRAG?: boolean } = {}
) {
  const npc = NPCS.find((n) => n.id === npcId);
  if (!npc) throw new Error("NPC not found");

  const node = HISTORICAL_NODES.find(n => n.id === sceneId);
  const context = node ? `当前历史场景：${node.year}年 ${node.title}（${node.description}）。用户扮演的角色是：${node.identity}。玩家正向你提问。` : '';

  let enhancedMessage = message;
  let retrievedContext = '';

  // RAG 检索增强
  if (options.useRAG !== false && RAG_ENABLED) {
    try {
      const searchResults = await searchSimilarChunks(message, {
        topK: RAG_TOP_K,
        sceneId: sceneId,
        threshold: RAG_THRESHOLD
      });

      if (searchResults.length > 0) {
        retrievedContext = searchResults.map((r, i) => 
          `[${i + 1}] ${r.title}: ${r.chunkText}`
        ).join('\n\n');
        
        enhancedMessage = `用户问题：${message}\n\n基于以下历史资料回答（请优先使用资料中的信息）：\n\n${retrievedContext}`;
        console.log(`[RAG] Retrieved ${searchResults.length} chunks for query`);
      }
    } catch (err) {
      console.error('[RAG] Search error:', err);
      // RAG 失败时继续使用原始消息
    }
  }

  const systemPrompt = `${npc.systemPrompt}\n${context}\n请基于该时代背景和你的身份，用符合你性格的方式回答问题并给予修正反馈。保持沉浸感。${retrievedContext ? '\n\n你会获得相关的历史资料作为参考，请优先使用资料中的准确信息。' : ''}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: enhancedMessage }] }
      ],
      config: {
        systemInstruction: systemPrompt,
      },
    });
    return response.text;
  } catch (err) {
    console.error("AI Chat Error:", err);
    return "抱歉，我的时空连接受到干扰，请稍后再试。";
  }
}

export async function generateSceneDescription(sceneId: string) {
  const node = HISTORICAL_NODES.find(n => n.id === sceneId);
  if (!node) throw new Error("Scene not found");

  const prompt = `你是一个历史场景模拟器。请根据以下信息，生成一段沉浸式的、具有文学感的历史场景描述（约150-200字）。
  年份：${node.year}
  事件：${node.title}
  身份：${node.identity}
  任务：${node.mission}
  
  要求：
  1. 使用第一人称，营造紧张或庄重的氛围。
  2. 包含环境描写（如声音、气味、光影）。
  3. 强调任务的紧迫感。
  4. 结尾留有悬念，引导用户开始行动。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text;
  } catch (err) {
    console.error("Scene Desc Error:", err);
    return "历史的迷雾笼罩了一切，你只能隐约感觉到周围的寒冷。";
  }
}

export async function generateDynamicQuiz(sceneId: string, logs: string[]) {
  const node = HISTORICAL_NODES.find(n => n.id === sceneId);
  if (!node) throw new Error("Scene not found");

  const prompt = `根据用户在历史场景【${node.title}】中的互动记录，生成 5 道选择题。
  用户的行动记录：
  ${logs.join('\n') || "无具体记录"}

  要求这 5 道题中，3道考查相关的历史背景知识，2道基于用户的行动决策进行情景假设评价题。
  
  必须输出纯 JSON 数组，不带任何 Markdown 标记。格式严格如下：
  [
    {
      "id": "Q1",
      "title": "题目内容",
      "options": [
        { "id": "A", "text": "选项A", "isCorrect": true },
        { "id": "B", "text": "选项B", "isCorrect": false },
        { "id": "C", "text": "选项C", "isCorrect": false },
        { "id": "D", "text": "选项D", "isCorrect": false }
      ],
      "explanation": "解析内容"
    }
  ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });
    
    let text = response.text || "[]";
    return JSON.parse(text);
  } catch (err) {
    console.error("Generate Quiz Error:", err);
    return [];
  }
}

export async function analyzePersonaLog(logs: string[]) {
  const prompt = `分析下列用户的全量互动日志，生成他们的人格画像评分（单项满分 100 分）。
  记录：
  ${logs.join('\n') || "未提供具体的有效记录"}

  如果没有交互记录，给出标准的 50 分平均分。
  请分别评价以下 5 个维度并给出综合评语：
  1. strategic (战略力)
  2. empathy (共情力)
  3. people_oriented (民本观)
  4. meticulousness (缜密度)
  5. pragmatic (务实度)

  输出必须为纯 JSON 对象，不要带有任何 Markdown 语法。严格遵循如下结构：
  {
    "strategic": 85,
    "empathy": 90,
    "people_oriented": 88,
    "meticulousness": 75,
    "pragmatic": 95,
    "ai_comments": "综合来看，该学员在处理历史事件时展现了极高的务实和共情能力..."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });
    
    let text = response.text || "{}";
    return JSON.parse(text);
  } catch (err) {
    console.error("Analyze Persona Error:", err);
    return {
      strategic: 50, empathy: 50, people_oriented: 50, meticulousness: 50, pragmatic: 50, 
      ai_comments: "智能分析暂时离线，采用暂定平均值。"
    };
  }
}
