import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatResponse(systemPrompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return response.text || "抱歉，我现在无法回应。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接历史档案库时出现错误，请稍后再试。";
  }
}

export async function generateSceneDescription(year: string, title: string, identity: string, mission: string) {
  const prompt = `你是一个历史场景模拟器。请根据以下信息，生成一段沉浸式的、具有文学感的历史场景描述（约150-200字）。
  年份：${year}
  事件：${title}
  身份：${identity}
  任务：${mission}
  
  要求：
  1. 使用第一人称，营造紧张或庄重的氛围。
  2. 包含环境描写（如声音、气味、光影）。
  3. 强调任务的紧迫感。
  4. 结尾留有悬念，引导用户开始行动。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || "历史的迷雾笼罩了一切，你只能隐约感觉到周围的寒冷。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "档案库连接中断，场景加载失败。";
  }
}
