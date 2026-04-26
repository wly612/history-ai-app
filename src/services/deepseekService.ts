import { chatWithNpc } from './apiClient';

export async function getChatResponse(
  npcId: string,
  sceneId: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  message: string,
  userName?: string
) {
  return chatWithNpc(npcId, sceneId, history, message, userName);
}

export async function generateSceneDescription() {
  return '场景内容由后端 DeepSeek 接口生成，请通过服务端 API 获取。';
}
