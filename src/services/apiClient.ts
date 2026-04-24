const API_BASE = 'http://localhost:3001/api';

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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function chatWithNpc(npcId: string, sceneId: string, history: any[], message: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ npcId, sceneId, history, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.text;
}

export async function generateQuiz(sceneId: string) {
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.questions;
}

export async function submitLog(sceneId: string, text: string) {
  const res = await fetch(`${API_BASE}/log`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId, text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function generateReport() {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function sendEmailReport(email: string, reportData: any) {
  const res = await fetch(`${API_BASE}/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, reportData }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function sendDingTalkReport(reportData: any) {
  const res = await fetch(`${API_BASE}/send-dingtalk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reportData }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// ==================== 场景剧情 API ====================

export async function getStoryScript(sceneId: string) {
  const res = await fetch(`${API_BASE}/story/script/${sceneId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.script;
}

export async function startStory(sceneId: string) {
  const res = await fetch(`${API_BASE}/story/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function continueStory(sceneId: string, nodeId: string, previousChoices: string[]) {
  const res = await fetch(`${API_BASE}/story/continue`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sceneId, nodeId, previousChoices }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
