const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function readJsonResponse(res: Response) {
  const text = await res.text();

  if (!text.trim()) {
    throw new Error(`接口返回了空响应：${res.status} ${res.statusText}`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`接口返回的不是合法 JSON：${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || `请求失败：${res.status} ${res.statusText}`);
  }

  return data;
}

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return readJsonResponse(res);
}

export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  return readJsonResponse(res);
}

export async function chatWithNpc(npcId: string, sceneId: string, history: any[], message: string, userName?: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ npcId, sceneId, history, message, userName }),
  });
  const data = await readJsonResponse(res);
  return data.text;
}

export async function generateQuiz(sceneId: string) {
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId }),
  });
  const data = await readJsonResponse(res);
  return data.questions;
}

export async function submitLog(sceneId: string, text: string) {
  const res = await fetch(`${API_BASE}/log`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId, text }),
  });
  return readJsonResponse(res);
}

export async function generateReport() {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return readJsonResponse(res);
}

export async function getLearningLogs() {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return readJsonResponse(res);
}

export async function sendEmailReport(email: string, reportData: any) {
  const res = await fetch(`${API_BASE}/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, reportData }),
  });
  return readJsonResponse(res);
}

export async function sendDingTalkReport(reportData: any) {
  const res = await fetch(`${API_BASE}/send-dingtalk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reportData }),
  });
  return readJsonResponse(res);
}

// ==================== 场景剧情 API ====================

export async function getStoryScript(sceneId: string) {
  const res = await fetch(`${API_BASE}/story/script/${sceneId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  const data = await readJsonResponse(res);
  return data.script;
}

export async function startStory(sceneId: string) {
  const res = await fetch(`${API_BASE}/story/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId }),
  });
  return readJsonResponse(res);
}

export async function chooseInStory(
  sceneId: string,
  nodeId: string,
  choiceId: string,
  previousChoices: string[],
  personalityAccumulator: any
) {
  const res = await fetch(`${API_BASE}/story/choose`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId, nodeId, choiceId, previousChoices, personalityAccumulator }),
  });
  return readJsonResponse(res);
}

export async function continueStory(sceneId: string, nodeId: string, previousChoices: string[]) {
  const res = await fetch(`${API_BASE}/story/continue`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId, nodeId, previousChoices }),
  });
  return readJsonResponse(res);
}
