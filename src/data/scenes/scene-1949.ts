import { SceneScript } from '../../types';

/**
 * 1949年 开国大典 场景剧本
 *
 * 身份：天安门广场旗手
 * 任务：护卫第一面五星红旗冉冉升起
 */

export const scene1949: SceneScript = {
  sceneId: '1949',
  title: '开国大典',
  description: '新中国诞生',
  startNodeId: 'node-1',
  endingNodes: ['node-5a', 'node-5b', 'node-5c'],

  nodes: [
    // ==================== 节点1：开场叙述 ====================
    {
      id: 'node-1',
      sceneId: '1949',
      nodeType: 'narrative',
      content: `1949年10月1日，北京天安门广场。

你是解放军的一名旗手。今天，你将护卫着第一面五星红旗，在《义勇军进行曲》中将其升起。

天安门广场上，三十万群众已经聚集。五星红旗在晨风中轻轻飘动，等待着那个历史性的时刻。

你的手微微颤抖——不是因为紧张，而是因为激动。一个旧时代即将结束，一个新时代将在你的手中诞生。`,
      speaker: 'narrator'
    },

    // ==================== 节点2：遭遇事件 ====================
    {
      id: 'node-2',
      sceneId: '1949',
      nodeType: 'encounter',
      content: `升旗仪式前，你站在旗杆下检查设备。

突然，你发现电动升旗装置有异样——传动齿轮似乎有些松动。如果故障，旗帜可能无法正常升起。

距离仪式开始只有不到两个小时了。你必须做出选择...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-2a',
          text: '立即报告上级，请求技术人员紧急维修',
          hint: '专业处理',
          nextNodeId: 'node-3a',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        },
        {
          id: 'choice-2b',
          text: '自己尝试修复，同时准备人工升旗方案',
          hint: '两手准备',
          nextNodeId: 'node-3b',
          personalityImpact: { strategic: 5, meticulousness: 5 }
        },
        {
          id: 'choice-2c',
          text: '相信设备没问题，继续按原计划进行',
          hint: '冒险选择',
          nextNodeId: 'node-3a',
          personalityImpact: { pragmatic: 3, strategic: -3 }
        }
      ]
    },

    // ==================== 节点3a：对话（维修成功） ====================
    {
      id: 'node-3a',
      sceneId: '1949',
      nodeType: 'dialogue',
      content: `技术人员迅速到场，很快修复了问题。

"同志，幸好你发现得早！"技术员擦着汗说，"这要是升到一半卡住了，那可就是历史性的事故啊！"

他拍了拍你的肩膀：

"你叫什么名字？我要向上级报告你的警觉性！今天这个日子，可不能出任何差错。"

这时，一位老红军走过来，他的胸前挂满了勋章：

"小伙子，准备好了吗？这一升，可就是升起了一个新中国啊！你紧张吗？"`,
      speaker: 'narrator',
      speakerName: '老红军',
      choices: [
        {
          id: 'choice-3a-1',
          text: '"报告首长，不紧张！我已经准备好了！"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, pragmatic: 3 }
        },
        {
          id: 'choice-3a-2',
          text: '"说实话有点紧张，但我会全力以赴的！"',
          nextNodeId: 'node-4',
          personalityImpact: { empathy: 3, meticulousness: 3 }
        }
      ],
      historicalContext: '开国大典当天，确实曾有升旗装置故障的担忧。技术人员彻夜检查，确保万无一失。'
    },

    // ==================== 节点3b：对话（两手准备） ====================
    {
      id: 'node-3b',
      sceneId: '1949',
      nodeType: 'dialogue',
      content: `你一边尝试修复，一边准备了备用绳索。

老班长看到你忙碌的身影，走过来：

"小伙子，想得周到！当年我在延安，升旗可全靠人拉。设备这东西，说不准什么时候就出问题。"

他帮你检查了备用绳索：

"你这样有备无患的思路很好。革命工作，就是要多想几步。"

他顿了顿，眼眶有些湿润：

"我的战友们，很多都没能等到这一天。小伙子，你替他们好好看着这面旗升起吧。"`,
      speaker: 'narrator',
      speakerName: '老班长',
      choices: [
        {
          id: 'choice-3b-1',
          text: '"班长放心，我一定不辜负战友们的期望！"',
          nextNodeId: 'node-4',
          personalityImpact: { empathy: 5, people_oriented: 5 }
        },
        {
          id: 'choice-3b-2',
          text: '"这面旗，是所有革命先烈的旗帜。"',
          nextNodeId: 'node-4',
          personalityImpact: { people_oriented: 5, meticulousness: 3 }
        }
      ],
      historicalContext: '新中国的成立，是无数革命先烈用鲜血换来的。从1921年到1949年，中国共产党领导人民经过28年艰苦卓绝的斗争，终于建立了中华人民共和国。'
    },

    // ==================== 节点4：关键抉择 ====================
    {
      id: 'node-4',
      sceneId: '1949',
      nodeType: 'choice',
      content: `下午3时，毛泽东主席站在天安门城楼上，向全世界庄严宣告：

"中华人民共和国中央人民政府今天成立了！"

全场欢呼声震天动地。现在，轮到你执行那个神圣的任务——升起第一面五星红旗。

在按下按钮的那一刻，你想到了什么？`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-4a',
          text: '想到那些牺牲的战友，想到人民的期盼，稳步升起国旗',
          hint: '铭记历史',
          nextNodeId: 'node-5a',
          personalityImpact: { people_oriented: 5, empathy: 5, strategic: 5 }
        },
        {
          id: 'choice-4b',
          text: '想到新中国的未来，满怀希望地升起国旗',
          hint: '展望未来',
          nextNodeId: 'node-5a',
          personalityImpact: { strategic: 5, pragmatic: 3 }
        },
        {
          id: 'choice-4c',
          text: '想到自己完成了任务，轻松地升起国旗',
          hint: '仅视为任务',
          nextNodeId: 'node-5b',
          personalityImpact: { pragmatic: 3, people_oriented: -3 }
        }
      ],
      historicalContext: '1949年10月1日，毛泽东主席在天安门城楼上按下电钮，第一面五星红旗在《义勇军进行曲》中升起，标志着中华人民共和国的诞生。'
    },

    // ==================== 节点5a：结局（成功） ====================
    {
      id: 'node-5a',
      sceneId: '1949',
      nodeType: 'ending',
      content: `五星红旗在《义勇军进行曲》中冉冉升起。

54门礼炮齐鸣28响，象征着中国共产党领导人民奋斗的28年。

你站在旗杆下，看着那面鲜红的旗帜在蓝天下飘扬。广场上，三十万群众欢呼雀跃，"中华人民共和国万岁"的呼声响彻云霄。

这一刻，你热泪盈眶。你成为了历史的见证者，也成为了历史的创造者。

---

**历史真相**

1949年10月1日下午3时，北京天安门广场。

毛泽东主席向全世界庄严宣告："中华人民共和国中央人民政府今天成立了！"

第一面五星红旗升起，54门礼炮齐鸣28响。

中国人民从此站起来了！

一个崭新的时代，开始了。`,
      endingType: 'success'
    },

    // ==================== 节点5b：结局（部分成功） ====================
    {
      id: 'node-5b',
      sceneId: '1949',
      nodeType: 'ending',
      content: `你完成了任务，国旗顺利升起。

但你心中总觉得少了些什么。这个历史性的时刻，你似乎没有完全理解它的分量。

多年后，当你回想起那一天，你会想：如果当时更深刻地感受那个时刻，该多好。

---

**历史启示**

历史的每一个重要时刻，都值得被铭记、被珍视。

参与其中，更要懂得其中的意义。`,
      endingType: 'partial'
    },

    // ==================== 节点5c：结局（失败） ====================
    {
      id: 'node-5c',
      sceneId: '1949',
      nodeType: 'ending',
      content: `由于之前的疏忽，升旗装置在关键时刻出现了小问题。

幸好有备用方案，国旗最终还是升起了。但这个插曲让你无比懊悔。

你深刻地认识到：历史性的任务，容不得半点马虎。

---

**历史启示**

在关键时刻，每一处细节都可能影响全局。

责任感，是最重要的品质。`,
      endingType: 'failure'
    }
  ]
};

export default scene1949;
