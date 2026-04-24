import { SceneScript, StoryNode } from '../src/types';
import scene1937 from '../src/data/scenes/scene-1937';
import scene1938 from '../src/data/scenes/scene-1938';
import scene1945Resistance from '../src/data/scenes/scene-1945-resistance';
import scene1945Liberation from '../src/data/scenes/scene-1945-liberation';
import scene1948 from '../src/data/scenes/scene-1948';
import scene1949 from '../src/data/scenes/scene-1949';

// 场景剧本映射
const sceneScripts: Record<string, SceneScript> = {
  '1937': scene1937,
  '1938': scene1938,
  '1945-resistance': scene1945Resistance,
  '1945-liberation': scene1945Liberation,
  '1948': scene1948,
  '1949': scene1949,
};

/**
 * 获取场景剧本
 */
export function getSceneScript(sceneId: string): SceneScript | null {
  return sceneScripts[sceneId] || null;
}

/**
 * 获取指定节点
 */
export function getStoryNode(sceneId: string, nodeId: string): StoryNode | null {
  const script = getSceneScript(sceneId);
  if (!script) return null;
  return script.nodes.find(n => n.id === nodeId) || null;
}

/**
 * 获取下一个节点
 */
export function getNextNode(sceneId: string, currentNodeId: string, choiceId?: string): StoryNode | null {
  const script = getSceneScript(sceneId);
  if (!script) return null;

  const currentNode = getStoryNode(sceneId, currentNodeId);
  if (!currentNode) return null;

  // 如果有选择，找到选择对应的下一个节点
  if (choiceId && currentNode.choices) {
    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (choice && choice.nextNodeId) {
      return getStoryNode(sceneId, choice.nextNodeId);
    }
  }

  // 默认返回第一个节点（用于开始场景）
  if (currentNodeId === 'start') {
    return getStoryNode(sceneId, script.startNodeId);
  }

  return null;
}

/**
 * 检查是否为结局节点
 */
export function isEndingNode(sceneId: string, nodeId: string): boolean {
  const script = getSceneScript(sceneId);
  if (!script) return false;
  return script.endingNodes.includes(nodeId);
}

/**
 * 获取场景列表
 */
export function getAvailableScenes(): { id: string; title: string; description: string }[] {
  return Object.values(sceneScripts).map(script => ({
    id: script.sceneId,
    title: script.title,
    description: script.description
  }));
}
