import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
// We can import types from the frontend
import { NPCS, HISTORICAL_NODES } from '../src/types';
import { searchSimilarChunks, buildRAGPrompt } from './ragService';

// 优先加载 .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

// 配置全局代理（让所有 fetch 请求都走代理）
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (PROXY_URL) {
  console.log('使用代理:', PROXY_URL);
  setGlobalDispatcher(new ProxyAgent(PROXY_URL));
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash-lite';
const RETRYABLE_STATUS = new Set([429, 500, 503]);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(
  request: Omit<Parameters<typeof ai.models.generateContent>[0], 'model'>,
  models: string[] = [PRIMARY_MODEL, FALLBACK_MODEL]
) {
  let lastError: any;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await ai.models.generateContent({
          ...request,
          model,
        });
      } catch (err: any) {
        lastError = err;
        const status = err?.status;
        const isRetryable = RETRYABLE_STATUS.has(status);
        const isLastAttempt = attempt === 2;

        if (!isRetryable || isLastAttempt) {
          break;
        }

        await sleep(800 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

// RAG 配置
const RAG_ENABLED = process.env.RAG_ENABLED === 'true';
const RAG_TOP_K = parseInt(process.env.RAG_TOP_K || '5');
const RAG_THRESHOLD = parseFloat(process.env.RAG_THRESHOLD || '0.7');

export async function chatWithHistoricalFigure(
  npcId: string, 
  sceneId: string, 
  history: any[], 
  message: string,
  options: { useRAG?: boolean; userName?: string } = {}
) {
  const npc = NPCS.find((n) => n.id === npcId);
  if (!npc) throw new Error("NPC not found");

  const node = HISTORICAL_NODES.find(n => n.id === sceneId);
  const learnerName = options.userName?.trim() || '这位馆员';
  const context = node ? `当前历史场景：${node.year}年 ${node.title}（${node.description}）。用户扮演的角色是：${node.identity}。玩家账号名是：${learnerName}。请在称呼对方时优先使用这个账号名，不要使用任何占位符或系统变量名。玩家正向你提问。` : `玩家账号名是：${learnerName}。请在称呼对方时优先使用这个账号名，不要使用任何占位符或系统变量名。`;

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
    console.log('[AI] 正在调用 Gemini API...');
    console.log('[AI] 代理设置 - HTTP_PROXY:', process.env.HTTP_PROXY || '未设置');
    console.log('[AI] 代理设置 - HTTPS_PROXY:', process.env.HTTPS_PROXY || '未设置');

    const response = await generateWithRetry({
      contents: [
        ...history,
        { role: 'user', parts: [{ text: enhancedMessage }] }
      ],
      config: {
        systemInstruction: systemPrompt,
      },
    });
    console.log('[AI] API 调用成功');
    return (response.text || '抱歉，我的时空连接受到干扰，请稍后再试。')
      .replace(/<seg_\d+>/gi, learnerName)
      .replace(/<user_name>/gi, learnerName)
      .replace(/\b玩家\b/g, learnerName);
  } catch (err: any) {
    console.error("=== AI Chat Error ===");
    console.error("错误类型:", err.constructor?.name);
    console.error("错误信息:", err.message);
    console.error("错误详情:", JSON.stringify(err, null, 2));
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
    const response = await generateWithRetry({
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
    const response = await generateWithRetry({
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
    const response = await generateWithRetry({
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

// ==================== 场景剧情生成函数 ====================

/**
 * 生成剧情节点的详细内容
 */
export async function generateStoryNodeContent(
  sceneId: string,
  nodeId: string,
  aiPromptHint: string,
  previousChoices: string[] = []
): Promise<string> {
  const node = HISTORICAL_NODES.find(n => n.id === sceneId);
  const sceneContext = node
    ? `当前场景：${node.year}年 ${node.title}（${node.description}）。用户身份：${node.identity}。任务：${node.mission}。`
    : '';

  const choicesContext = previousChoices.length > 0
    ? `\n\n用户之前的选择：\n${previousChoices.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : '';

  const prompt = `你是一个沉浸式历史场景的叙述者。请根据以下提示生成场景描述。

${sceneContext}${choicesContext}

要求：
${aiPromptHint}

注意：
1. 使用第一人称（"你"）来描述
2. 营造沉浸感和紧张感
3. 融入准确的历史背景
4. 不要输出任何额外的说明或标记`;

  try {
    const response = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "历史的迷雾笼罩了一切...";
  } catch (err) {
    console.error("Generate Story Node Error:", err);
    return "时空信号中断，请稍后再试...";
  }
}

/**
 * 生成选择后果描述
 */
export async function generateChoiceConsequence(
  sceneId: string,
  choiceText: string,
  nextNodeHint: string
): Promise<string> {
  const prompt = `用户在历史场景中做出了选择："${choiceText}"

下一场景提示：${nextNodeHint}

请生成一段简短的过渡描述（50-80字），描述用户选择后发生的事情。
要求：
1. 使用第二人称
2. 简洁有力
3. 制造悬念感`;

  try {
    const response = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "你做出了选择...";
  } catch (err) {
    console.error("Generate Consequence Error:", err);
    return "命运的齿轮开始转动...";
  }
}

/**
 * 生成结局总结
 */
export async function generateEndingSummary(
  sceneId: string,
  endingType: 'success' | 'partial' | 'failure',
  choices: string[],
  personalityImpact: any
): Promise<string> {
  const node = HISTORICAL_NODES.find(n => n.id === sceneId);
  const sceneTitle = node ? `${node.year}年 ${node.title}` : '历史场景';

  const endingPrompt = {
    success: '用户做出了与历史一致的正确选择，成功完成了任务。',
    partial: '用户的选择部分正确，但仍有改进空间。',
    failure: '用户的选择与历史相悖，导致不理想的结局。'
  };

  const prompt = `场景：${sceneTitle}
结局类型：${endingType}
${endingPrompt[endingType]}

用户的选择历程：
${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

人格影响：
- 战略力: ${personalityImpact.strategic >= 0 ? '+' : ''}${personalityImpact.strategic}
- 共情力: ${personalityImpact.empathy >= 0 ? '+' : ''}${personalityImpact.empathy}
- 民本观: ${personalityImpact.people_oriented >= 0 ? '+' : ''}${personalityImpact.people_oriented}
- 缜密度: ${personalityImpact.meticulousness >= 0 ? '+' : ''}${personalityImpact.meticulousness}
- 务实度: ${personalityImpact.pragmatic >= 0 ? '+' : ''}${personalityImpact.pragmatic}

请生成一段结局总结（100-150字）：
1. 评价用户在场景中的表现
2. 说明选择带来的后果
3. 提供历史启示或学习建议`;

  try {
    const response = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "历史的审判已经结束...";
  } catch (err) {
    console.error("Generate Ending Error:", err);
    return "时空档案记录中断...";
  }
}
