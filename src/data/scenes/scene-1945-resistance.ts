import { SceneScript } from '../../types';

/**
 * 1945年 抗战胜利 场景剧本
 *
 * 身份：受降仪式见证者
 * 任务：亲眼见证侵略者递交投降书的历史瞬间
 */

export const scene1945Resistance: SceneScript = {
  sceneId: '1945-resistance',
  title: '抗战胜利',
  description: '日本无条件投降',
  startNodeId: 'node-1',
  endingNodes: ['node-5a', 'node-5b', 'node-5c'],

  nodes: [
    // ==================== 节点1：开场叙述 ====================
    {
      id: 'node-1',
      sceneId: '1945-resistance',
      nodeType: 'narrative',
      content: `1945年9月9日，南京。

你是一名青年学生代表，受邀参加中国战区受降仪式。

八年苦战，三千五百万同胞伤亡，终于换来了今天。

你站在中央军校大礼堂外，看着各国记者架设相机，看着礼兵肃穆地站岗。再过不久，日本代表将在投降书上签字。

你的心情复杂：有激动，有欣慰，也有对那些没能看到这一天的战友们的哀思...`,
      speaker: 'narrator'
    },

    // ==================== 节点2：遭遇事件 ====================
    {
      id: 'node-2',
      sceneId: '1945-resistance',
      nodeType: 'encounter',
      content: `在礼堂外，你遇到了一位坐轮椅的老兵。

他的腿在台儿庄战役中失去了，但今天，他执意要让家人推着他来见证这一刻。

"八年啊..."他的声音颤抖，"我的战友们，都没能等到这一天。"

他从怀里掏出一封泛黄的信，那是他牺牲的战友留下的遗书。

"孩子，你能帮我读一下吗？我眼睛花了，看不清了..."`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-2a',
          text: '接过信，认真地为他朗读',
          hint: '尊重与缅怀',
          nextNodeId: 'node-3a',
          personalityImpact: { empathy: 5, people_oriented: 5 }
        },
        {
          id: 'choice-2b',
          text: '请他讲讲战友的故事',
          hint: '倾听与铭记',
          nextNodeId: 'node-3a',
          personalityImpact: { empathy: 5, meticulousness: 3 }
        },
        {
          id: 'choice-2c',
          text: '邀请他一起进入会场',
          hint: '共同见证',
          nextNodeId: 'node-3b',
          personalityImpact: { people_oriented: 5, pragmatic: 3 }
        }
      ]
    },

    // ==================== 节点3a：对话（信件） ====================
    {
      id: 'node-3a',
      sceneId: '1945-resistance',
      nodeType: 'dialogue',
      content: `你轻轻展开那封泛黄的信：

"亲爱的父母：当你们看到这封信时，我已经为国捐躯了。请不要悲伤，因为你们的儿子是在保卫祖国的战斗中牺牲的。等胜利的那一天，请替我去看看天安门，替我向国旗敬一个军礼..."

老兵泪流满面："他是我的班长，1942年在长沙牺牲的。他才22岁啊..."

他紧紧握住你的手："孩子，你们这一代是幸运的。和平来之不易，你们要好好珍惜。你说，我们这场仗，打得值不值？"`,
      speaker: 'narrator',
      speakerName: '老兵',
      choices: [
        {
          id: 'choice-3a-1',
          text: '"值！我们永远铭记先烈们的牺牲，和平是用鲜血换来的。"',
          nextNodeId: 'node-4',
          personalityImpact: { empathy: 5, people_oriented: 5 }
        },
        {
          id: 'choice-3a-2',
          text: '"我们这一代人，会用实际行动来回报先烈的牺牲。"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 3, pragmatic: 5 }
        }
      ],
      historicalContext: '八年抗战，中国军民伤亡超过3500万人。每一位牺牲者，都是为了今天的和平。'
    },

    // ==================== 节点3b：对话（进入会场） ====================
    {
      id: 'node-3b',
      sceneId: '1945-resistance',
      nodeType: 'dialogue',
      content: `你推着老兵进入会场，工作人员看到他的军装和勋章，肃然起敬，让出了前排的位置。

"谢谢你，孩子。"老兵感慨道，"我没想过，这辈子还能亲眼看到日本人投降。"

他指着会场中央：

"看到那个位置了吗？那是给日本代表留的。他们曾经多么嚣张，今天就要在那里低着头签字。"

他转向你：

"八年了，终于等到这一天。你说，战争真的结束了吗？以后中国人不用再受欺负了吧？"`,
      speaker: 'narrator',
      speakerName: '老兵',
      choices: [
        {
          id: 'choice-3b-1',
          text: '"是的，我们赢了！从此中国人民站起来了！"',
          nextNodeId: 'node-4',
          personalityImpact: { people_oriented: 5, empathy: 3 }
        },
        {
          id: 'choice-3b-2',
          text: '"战争结束了，但我们要记住历史的教训，让悲剧不再重演。"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, meticulousness: 5 }
        }
      ]
    },

    // ==================== 节点4：关键抉择 ====================
    {
      id: 'node-4',
      sceneId: '1945-resistance',
      nodeType: 'choice',
      content: `受降仪式即将开始。

日本代表冈村宁次等人在中国军官的押送下进入会场。他们的脸上，是掩饰不住的落败与不甘。

作为青年学生代表，你有机会提出一个要求。老兵看向你：

"孩子，你代表的是未来的一代人。你想对这个世界说什么？"`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-4a',
          text: '"铭记历史，珍爱和平，绝不让悲剧重演！"',
          hint: '历史正确选择',
          nextNodeId: 'node-5a',
          personalityImpact: { strategic: 5, people_oriented: 5, empathy: 5 }
        },
        {
          id: 'choice-4b',
          text: '"让侵略者付出代价，正义终将战胜邪恶！"',
          hint: '正义呼声',
          nextNodeId: 'node-5a',
          personalityImpact: { people_oriented: 5, pragmatic: 3 }
        },
        {
          id: 'choice-4c',
          text: '"战争结束了，我们应该向前看。"',
          hint: '过于轻率',
          nextNodeId: 'node-5b',
          personalityImpact: { pragmatic: 3, meticulousness: -3 }
        }
      ],
      historicalContext: '1945年9月9日，中国战区受降仪式在南京举行。日本代表冈村宁次向中国政府代表递交投降书，正式结束了八年抗战。'
    },

    // ==================== 节点5a：结局（成功） ====================
    {
      id: 'node-5a',
      sceneId: '1945-resistance',
      nodeType: 'ending',
      content: `日本代表在投降书上签字的那一刻，全场掌声雷动。

老兵热泪盈眶，挣扎着要站起来，向国旗敬礼。你扶着他，感受到了这一刻的分量。

八年，三千五百万同胞的生命，终于换来了这一刻的胜利。

你记住了一个道理：和平来之不易，历史不容忘记。

---

**历史真相**

1945年8月15日，日本宣布无条件投降。

9月2日，日本在美军密苏里号战列舰上签署投降书。

9月9日，中国战区受降仪式在南京举行，冈村宁次向中国政府代表递交投降书，八年抗战正式结束。

中国人民取得了近代以来反抗外敌入侵的第一次完全胜利。`,
      endingType: 'success'
    },

    // ==================== 节点5b：结局（部分成功） ====================
    {
      id: 'node-5b',
      sceneId: '1945-resistance',
      nodeType: 'ending',
      content: `你见证了受降仪式，但"向前看"的态度让老兵有些失望。

"孩子，"他说，"可以向前看，但不能忘记过去。忘记历史的人，注定要重蹈覆辙。"

他的话让你陷入沉思。胜利来之不易，更不能因为胜利而忘记那些牺牲。

---

**历史启示**

铭记历史不是为了延续仇恨，而是为了避免悲剧重演。

每一代中国人，都应该记住这段历史，记住那些为国捐躯的先烈。`,
      endingType: 'partial'
    },

    // ==================== 节点5c：结局（失败） ====================
    {
      id: 'node-5c',
      sceneId: '1945-resistance',
      nodeType: 'ending',
      content: `你在关键时刻没有把握住机会，错过了向世界发声的时机。

受降仪式结束了，你只是默默地看着。虽然胜利了，但你心中有一丝遗憾。

老兵拍了拍你的肩膀："下次，要勇敢一点。年轻人，要有担当。"

---

**历史启示**

历史性的时刻，需要有人站出来发声。

每一代人都有自己的责任，年轻人更应肩负起时代的使命。`,
      endingType: 'failure'
    }
  ]
};

export default scene1945Resistance;
