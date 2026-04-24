import { SceneScript } from '../../types';

/**
 * 1937年 卢沟桥事变 场景剧本
 * 使用预定义内容（不依赖 AI 生成）
 */

export const scene1937: SceneScript = {
  sceneId: '1937',
  title: '卢沟桥',
  description: '全民族抗战爆发',
  startNodeId: 'node-1',
  endingNodes: ['node-5a', 'node-5b', 'node-5c'],

  nodes: [
    // ==================== 节点1：开场叙述 ====================
    {
      id: 'node-1',
      sceneId: '1937',
      nodeType: 'narrative',
      content: `1937年7月7日深夜，北平郊外。

枪声，打破了卢沟桥的宁静。

你是一名第29军前线通讯员，手中紧握着一封紧急防御命令。这封信封上沾着硝烟的灰尘，里面承载着宛平城的生死存亡。

日军的探照灯在远处扫射，偶尔传来几声零星的枪响。你知道，今夜注定不会平静。

"把命令送到前线营长手中！"长官的命令犹在耳边。

你深吸一口气，迈步走向宛平城外的黑暗街道...`,
      speaker: 'narrator'
    },

    // ==================== 节点2：遭遇事件 ====================
    {
      id: 'node-2',
      sceneId: '1937',
      nodeType: 'encounter',
      content: `街道拐角处，突然传来整齐的脚步声。

你立刻贴墙站立，屏住呼吸。

一队日军士兵——约五六人——正从街道另一端走来。他们的刺刀在月光下闪烁着寒光，军靴踏在石板路上发出沉重的声响。

你心中紧握着命令信封。如果被发现，不仅任务失败，更可能危及整个宛平城的防御部署。

一条狭窄的小巷就在你身后，但绕道可能会延误送达时间。

你必须立刻做出决定...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-2a',
          text: '躲进小巷，等待巡逻队通过',
          hint: '安全但会延误时间',
          nextNodeId: 'node-3a',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        },
        {
          id: 'choice-2b',
          text: '假装平民，镇定通过',
          hint: '快速但有风险',
          nextNodeId: 'node-3b',
          personalityImpact: { strategic: 5, pragmatic: -3 }
        },
        {
          id: 'choice-2c',
          text: '绕道而行，寻找其他路线',
          hint: '保守但耗时最长',
          nextNodeId: 'node-3a',
          personalityImpact: { meticulousness: 3, strategic: 2 }
        }
      ]
    },

    // ==================== 节点3a：对话（躲避成功） ====================
    {
      id: 'node-3a',
      sceneId: '1937',
      nodeType: 'dialogue',
      content: `你成功避开了日军巡逻队，沿着小巷快速前进，终于抵达第29军前线阵地。

战壕中，一名军官正在研究地图。他抬起头，目光如炬——是佟麟阁，第29军副军长。

"你是通讯员？有什么消息？"他接过你递来的命令，神情逐渐凝重。

看完命令后，他沉默了片刻，然后看向你：

"情况比我们想象的更糟。日军已经包围宛平城，他们声称有一名士兵失踪，要求进城搜查。这是赤裸裸的借口！"

他紧握拳头，继续说道：

"你是从城外来的，你怎么看？我们该怎么做？"`,
      speaker: 'tong',
      speakerName: '佟麟阁',
      choices: [
        {
          id: 'choice-3a-1',
          text: '"副军长，日军这是找借口挑起战争，我们绝不能让他们进城！"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, people_oriented: 3 }
        },
        {
          id: 'choice-3a-2',
          text: '"我军应该先稳住局面，争取时间请求援军。"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 3, meticulousness: 5 }
        }
      ],
      historicalContext: '佟麟阁（1892-1937），抗日名将，第29军副军长。他在战斗中曾说"战死者光荣，偷生者耻辱"，后于1937年7月28日壮烈殉国。'
    },

    // ==================== 节点3b：对话（冒险通过） ====================
    {
      id: 'node-3b',
      sceneId: '1937',
      nodeType: 'dialogue',
      content: `你镇定地走向街道，日军士兵对你进行了一番盘问。

"这么晚了，你是什么人？"

"我是附近的农民，家里老人病了，去请大夫。"你平静地回答。

士兵狐疑地打量了你几眼，最终挥手放行。你强压住心中的紧张，缓步离开，直到转过街角才快步奔跑。

来到前线阵地，你遇到了赵登禹，第29军132师师长。他正组织大刀队准备反击。

"好小子！敢从日军眼皮底下穿过来，有种！"

他拍了拍你的肩膀，神色凝重起来：

"日军的气焰越来越嚣张了。他们已经发出最后通牒，要求两小时内开放城门。我们的大刀队已经准备好了，就等一声令下。"

他看向你：

"你愿意留下来和我们一起战斗吗？"`,
      speaker: 'zhao',
      speakerName: '赵登禹',
      choices: [
        {
          id: 'choice-3b-1',
          text: '"赵师长，我愿留下，与将士们共进退！"',
          nextNodeId: 'node-4',
          personalityImpact: { empathy: 5, people_oriented: 5 }
        },
        {
          id: 'choice-3b-2',
          text: '"师长，我必须返回报告情况，前线需要更多情报。"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, pragmatic: 3 }
        }
      ],
      historicalContext: '赵登禹（1898-1937），抗日烈士，第29军132师师长。他以骁勇善战著称，曾率大刀队重创日军，后于1937年7月28日与佟麟阁同日殉国。'
    },

    // ==================== 节点4：关键抉择 ====================
    {
      id: 'node-4',
      sceneId: '1937',
      nodeType: 'choice',
      content: `就在这时，一名士兵跑来报告：

"报告！日军已发出最后通牒，要求在两小时内开放宛平城门，否则将炮轰县城！"

紧张的气氛笼罩着整个指挥所。军官们面面相觑，等待着最后的决定。

城外，日军扩音器的喊话声隐约传来，夹杂着威胁与恐吓。

时间一分一秒流逝，历史的十字路口就在你面前。每一个选择，都可能改变这个国家的命运...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-4a',
          text: '坚决拒绝，号召全军准备战斗',
          hint: '历史正确选择',
          nextNodeId: 'node-5a',
          personalityImpact: { strategic: 5, people_oriented: 5, empathy: 3 }
        },
        {
          id: 'choice-4b',
          text: '提出谈判，争取时间',
          hint: '折中方案',
          nextNodeId: 'node-5b',
          personalityImpact: { strategic: 3, meticulousness: 3, pragmatic: 5 }
        },
        {
          id: 'choice-4c',
          text: '建议暂时撤退，保存实力',
          hint: '保守选择',
          nextNodeId: 'node-5c',
          personalityImpact: { pragmatic: 3, strategic: -3 }
        }
      ],
      historicalContext: '历史事实：第29军坚决拒绝了日军的无理要求。佟麟阁副军长下令"坚决抵抗"，卢沟桥事变由此爆发，标志着全民族抗战的开始。'
    },

    // ==================== 节点5a：结局（成功） ====================
    {
      id: 'node-5a',
      sceneId: '1937',
      nodeType: 'ending',
      content: `"我们绝不屈服！全军准备战斗！"

命令下达的那一刻，你看到了将士们眼中的火焰。

日军的炮火如期而至，宛平城的夜空被染成了血红色。但第29军没有退缩，他们用血肉之躯筑起了一道钢铁长城。

卢沟桥的枪声响彻夜空，这不仅仅是一场战斗的开始，更是全民族觉醒的号角。

你完成了任务，成为了历史的见证者。这场战斗，将永远被铭记。

---

**历史真相**

1937年7月7日，卢沟桥事变爆发。第29军在佟麟阁、赵登禹等将领的指挥下奋起抵抗。

7月8日，中共中央发出《为日军进攻卢沟桥通电》，呼吁"筑成民族统一战线的坚固长城"。

全民族抗战由此开始，历时八年，最终取得了伟大胜利。`,
      endingType: 'success'
    },

    // ==================== 节点5b：结局（部分成功） ====================
    {
      id: 'node-5b',
      sceneId: '1937',
      nodeType: 'ending',
      content: `你提议先进行谈判，争取时间。

然而，谈判只是日军的缓兵之计。他们根本无意和平，只是在等待增援。

不久后，炮火还是落在了宛平城。虽然最终中国军队奋起反击，但延误的时机让日军得到了喘息，局势变得更加艰难。

你意识到，在侵略者面前，妥协往往是徒劳的。有些人，永远不会被道理说服。

---

**历史启示**

日本发动七七事变是蓄谋已久的侵略行为。任何妥协退让都无法阻止侵略者的野心。

历史告诉我们：面对强权和侵略，唯有团结抗争，才能守护尊严与和平。`,
      endingType: 'partial'
    },

    // ==================== 节点5c：结局（失败） ====================
    {
      id: 'node-5c',
      sceneId: '1937',
      nodeType: 'ending',
      content: `你建议暂时撤退，保存实力。

然而，撤退的命令让军心动摇。日军乘虚而入，宛平城轻易落入敌手。

你看着那些失望的眼神，心中涌起深深的愧疚。也许，逃跑从来不是正确的选择。

但历史给了第二次机会。在接下来的战斗中，无数先烈用鲜血弥补了这次失误。你也将重新投入战斗，弥补这个错误。

---

**历史启示**

在民族存亡的关头，退缩只会让侵略者更加猖狂。

历史没有如果，但我们可以从中学习：勇气和信念，是抗战胜利的关键。`,
      endingType: 'failure'
    }
  ]
};

export default scene1937;
