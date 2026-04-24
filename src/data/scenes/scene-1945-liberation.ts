import { SceneScript } from '../../types';

/**
 * 1945年 重庆谈判 场景剧本
 *
 * 身份：和平请愿团成员
 * 任务：向国共双方代表递交和平请愿书，呼吁停止内战
 */

export const scene1945Liberation: SceneScript = {
  sceneId: '1945-liberation',
  title: '重庆谈判',
  description: '争取和平的努力',
  startNodeId: 'node-1',
  endingNodes: ['node-5a', 'node-5b', 'node-5c'],

  nodes: [
    // ==================== 节点1：开场叙述 ====================
    {
      id: 'node-1',
      sceneId: '1945-liberation',
      nodeType: 'narrative',
      content: `1945年8月，重庆。

抗战胜利的消息刚刚传来，但空气中已经弥漫着不安的气息。国共两党之间的矛盾，似乎一触即发。

你是一名和平请愿团的成员，手中握着一份请愿书。这份文件上，签着成千上万渴望和平的中国人的名字。

今天是毛泽东主席抵达重庆的日子。全中国乃至全世界，都在注视着这场关系国家命运的谈判。

你要把这份请愿书，亲手递交给国共双方的代表...`,
      speaker: 'narrator'
    },

    // ==================== 节点2：遭遇事件 ====================
    {
      id: 'node-2',
      sceneId: '1945-liberation',
      nodeType: 'encounter',
      content: `在桂园门外，聚集着大批民众和记者。

突然，人群中传来一阵骚动。有人高喊："共产党来谈判是假，拖延时间是真！"另一方则反驳："国民党根本没有诚意！"

眼看双方即将发生冲突，作为和平请愿团的成员，你必须采取行动...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-2a',
          text: '大声呼吁大家冷静，和平需要理性对话',
          hint: '维护秩序',
          nextNodeId: 'node-3a',
          personalityImpact: { empathy: 5, people_oriented: 5 }
        },
        {
          id: 'choice-2b',
          text: '请双方的代表出面调解',
          hint: '寻求权威',
          nextNodeId: 'node-3b',
          personalityImpact: { strategic: 5, pragmatic: 3 }
        },
        {
          id: 'choice-2c',
          text: '将请愿书高高举起，用行动表达诉求',
          hint: '引起关注',
          nextNodeId: 'node-3a',
          personalityImpact: { strategic: 3, meticulousness: 3 }
        }
      ]
    },

    // ==================== 节点3a：对话（民众互动） ====================
    {
      id: 'node-3a',
      sceneId: '1945-liberation',
      nodeType: 'dialogue',
      content: `你的呼吁让人群渐渐安静下来。

一位老人挤到你面前，他的眼睛里满是期待：

"小伙子，你拿着请愿书？我签了名的！我活了七十多岁，打了一辈子仗——军阀混战、日本入侵——我不想再看到中国人打中国人了！"

他颤抖的手抓住你的衣袖：

"你一定要把我们的心声告诉他们！我们只要和平！我们不要战争！你答应了，一定要把信送到啊！"`,
      speaker: 'narrator',
      speakerName: '老人',
      choices: [
        {
          id: 'choice-3a-1',
          text: '"老人家放心，我一定把您的心声带到！"',
          nextNodeId: 'node-4',
          personalityImpact: { empathy: 5, people_oriented: 5 }
        },
        {
          id: 'choice-3a-2',
          text: '"和平是所有人的期盼，我会尽全力的。"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 3, meticulousness: 5 }
        }
      ],
      historicalContext: '抗战胜利后，全国人民普遍渴望和平。重庆谈判期间，社会各界积极呼吁，希望国共两党能够和平建国。'
    },

    // ==================== 节点3b：对话（代表互动） ====================
    {
      id: 'node-3b',
      sceneId: '1945-liberation',
      nodeType: 'dialogue',
      content: `在你的请求下，一位中共代表走出来调解。

那是周恩来，他神态从容，微笑着向人群挥手：

"各位同胞，请相信我们有诚意谈判。毛主席冒着生命危险来到重庆，就是为了和平。"

他转向你：

"同志，你手里的请愿书，能让我看看吗？这是人民的心声，我们一定会认真对待。"

他接过请愿书，郑重地说：

"你觉得，这次谈判能成功吗？"`,
      speaker: 'zhou',
      speakerName: '周恩来',
      choices: [
        {
          id: 'choice-3b-1',
          text: '"人民渴望和平，我相信双方都有诚意。"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, empathy: 3 }
        },
        {
          id: 'choice-3b-2',
          text: '"不管结果如何，人民的声音必须被听到。"',
          nextNodeId: 'node-4',
          personalityImpact: { people_oriented: 5, meticulousness: 3 }
        }
      ],
      historicalContext: '周恩来（1898-1976），伟大的无产阶级革命家、外交家。重庆谈判期间，他作为中共代表团的重要成员，展现了卓越的外交智慧。'
    },

    // ==================== 节点4：关键抉择 ====================
    {
      id: 'node-4',
      sceneId: '1945-liberation',
      nodeType: 'choice',
      content: `请愿书最终递交到了双方代表手中。

然而，谈判的前景仍然充满不确定性。有传言说，国民党军队正在向解放区调动；也有人说，共产党在积极备战。

作为和平请愿团的成员，你有机会在记者会上发言，向全国表达你们的诉求。

你要说什么？`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-4a',
          text: '"无论谈判结果如何，我们呼吁双方以人民利益为重，避免内战！"',
          hint: '以民为本',
          nextNodeId: 'node-5a',
          personalityImpact: { people_oriented: 5, empathy: 5, strategic: 3 }
        },
        {
          id: 'choice-4b',
          text: '"希望双方信守承诺，让双十协定真正落实！"',
          hint: '关注执行',
          nextNodeId: 'node-5b',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        },
        {
          id: 'choice-4c',
          text: '"内战对谁都没好处，但也要看双方的诚意。"',
          hint: '态度模糊',
          nextNodeId: 'node-5c',
          personalityImpact: { pragmatic: 3, strategic: -3 }
        }
      ],
      historicalContext: '1945年10月10日，国共双方签署《双十协定》，但协定很快被国民党撕毁，内战于1946年全面爆发。'
    },

    // ==================== 节点5a：结局（成功） ====================
    {
      id: 'node-5a',
      sceneId: '1945-liberation',
      nodeType: 'ending',
      content: `你的发言被各大报纸转载，"以人民利益为重"成为那个时代最有力的呼声。

虽然历史的车轮最终驶向了内战，但你的努力没有白费。那份请愿书，那份呼吁和平的心声，被历史铭记。

多年后，你回想起那一天，心中仍有慰藉：至少，你为和平努力过。

---

**历史真相**

重庆谈判历时43天，1945年10月10日签署《双十协定》。

然而，协定签署不久，国民党便撕毁协议，向解放区发动进攻。

1946年6月，全面内战爆发。尽管如此，重庆谈判仍然具有重要的历史意义，它暴露了国民党的虚伪，也让全国人民看清了谁真正站在人民一边。`,
      endingType: 'success'
    },

    // ==================== 节点5b：结局（部分成功） ====================
    {
      id: 'node-5b',
      sceneId: '1945-liberation',
      nodeType: 'ending',
      content: `你关注协定的执行，但现实比预想的更加复杂。

《双十协定》签署了，但和平没有真正到来。双方都在备战，谈判似乎只是一场政治表演。

你的担忧不幸言中。协定被撕毁，内战爆发。

---

**历史启示**

和平不是一纸协议就能保障的。

真正的和平，需要双方都有诚意，更需要人民的持续努力。历史告诉我们：要保持警惕，要为正义而战。`,
      endingType: 'partial'
    },

    // ==================== 节点5c：结局（失败） ====================
    {
      id: 'node-5c',
      sceneId: '1945-liberation',
      nodeType: 'ending',
      content: `你模糊的态度让人失望。在那个关键的历史时刻，人民需要的是明确的声音。

老人失望地摇摇头："年轻人，你代表的是我们啊..."

历史的车轮滚滚向前，而你错失了为民发声的机会。

---

**历史启示**

在历史的十字路口，每一声呐喊都可能改变局势。

年轻人，要有立场，要有担当。`,
      endingType: 'failure'
    }
  ]
};

export default scene1945Liberation;
