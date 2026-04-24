import { SceneScript } from '../../types';

/**
 * 1948年 淮海战役 场景剧本
 *
 * 身份：支前民工
 * 任务：推着独轮车将军粮送达前线指挥部
 */

export const scene1948: SceneScript = {
  sceneId: '1948',
  title: '决战江淮',
  description: '三大战役决战',
  startNodeId: 'node-1',
  endingNodes: ['node-5a', 'node-5b', 'node-5c'],

  nodes: [
    // ==================== 节点1：开场叙述 ====================
    {
      id: 'node-1',
      sceneId: '1948',
      nodeType: 'narrative',
      content: `1948年冬，淮海战场。

你是一名普通农民，推着一辆独轮车，车上装满了军粮。陈毅元帅说过："淮海战役的胜利，是人民群众用小车推出来的。"

你，就是那千千万万小车中的一辆。

天寒地冻，道路泥泞。远处炮声隆隆，那是决战的前奏。60万解放军对阵80万国民党军，这场战役将决定中国的命运。

你紧握车把，一步一步向前线走去...`,
      speaker: 'narrator'
    },

    // ==================== 节点2：遭遇事件 ====================
    {
      id: 'node-2',
      sceneId: '1948',
      nodeType: 'encounter',
      content: `半路上，你遇到了一条被炸断的桥梁。

河水冰冷刺骨，前方的车队已经停滞不前。有人在商量绕道，有人建议涉水而过。

你的车上装的是前线急需的粮食，多耽误一分钟，战士们就多一分危险。

必须做出决定...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-2a',
          text: '带头涉水过河，为其他人探路',
          hint: '勇敢但危险',
          nextNodeId: 'node-3a',
          personalityImpact: { strategic: 3, empathy: 5 }
        },
        {
          id: 'choice-2b',
          text: '组织大家搭设临时便桥',
          hint: '稳妥但耗时',
          nextNodeId: 'node-3b',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        },
        {
          id: 'choice-2c',
          text: '寻找附近村民帮助，寻找其他过河点',
          hint: '借助外力',
          nextNodeId: 'node-3b',
          personalityImpact: { strategic: 5, people_oriented: 3 }
        }
      ]
    },

    // ==================== 节点3a：对话（涉水成功） ====================
    {
      id: 'node-3a',
      sceneId: '1948',
      nodeType: 'dialogue',
      content: `你咬紧牙关，第一个踏入冰冷的河水。

刺骨的寒意瞬间传遍全身，但你咬牙坚持。其他民工看到你成功了，纷纷跟上。

终于，你把粮食送到了前线。一位解放军战士接过粮袋，激动地握住你的手：

"老乡！你们来得太及时了！战士们两天没吃饱饭了！"

他递给你一碗热水：

"老乡，我们马上要发起总攻了。你们支前民工，是真正的英雄。你说，我们这一仗能赢吗？"`,
      speaker: 'narrator',
      speakerName: '战士',
      choices: [
        {
          id: 'choice-3a-1',
          text: '"一定能赢！因为人民和军队在一起！"',
          nextNodeId: 'node-4',
          personalityImpact: { people_oriented: 5, empathy: 5 }
        },
        {
          id: 'choice-3a-2',
          text: '"有你们这样的战士，有我们这样的百姓，天下无敌！"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, people_oriented: 3 }
        }
      ],
      historicalContext: '淮海战役期间，动员支前民工达543万人次，使用担架20万副、大小车88万辆。人民群众的支援是战役胜利的重要保障。'
    },

    // ==================== 节点3b：对话（搭桥成功） ====================
    {
      id: 'node-3b',
      sceneId: '1948',
      nodeType: 'dialogue',
      content: `你组织大家砍树搭桥，很快，一座简易便桥架设完成。

车队顺利通过，你继续向前线进发。在路边，你看到一群伤员被抬下来。

一位年轻的卫生员正在给伤员包扎，她的手冻得通红，但动作依然麻利。

"大叔，你是送粮食来的？"她抬起头，脸上带着疲惫但坚定的笑容，"谢谢你们！没有百姓的支援，我们撑不下去。"

她给你倒了一碗热水：

"大叔，你跑了一天了，歇歇吧。前面还在打仗呢，危险得很。"`,
      speaker: 'narrator',
      speakerName: '卫生员',
      choices: [
        {
          id: 'choice-3b-1',
          text: '"不打紧！粮食送到了，任务才算完成！"',
          nextNodeId: 'node-4',
          personalityImpact: { pragmatic: 5, empathy: 3 }
        },
        {
          id: 'choice-3b-2',
          text: '"你们在前线流血牺牲，我们出点力算什么！"',
          nextNodeId: 'node-4',
          personalityImpact: { people_oriented: 5, empathy: 5 }
        }
      ]
    },

    // ==================== 节点4：关键抉择 ====================
    {
      id: 'node-4',
      sceneId: '1948',
      nodeType: 'choice',
      content: `终于，你到达了前线指挥部。

指挥员告诉你，总攻即将开始。他们需要民工帮忙运送弹药上前线，但那是最危险的地带。

"老乡，"指挥员认真地说，"你们已经做了很多了。送弹药的任务，我们可以找别人。"

你看着那些即将冲锋的战士，他们比你还年轻...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-4a',
          text: '"我去！乡亲们在前线拼命，我怎能退缩！"',
          hint: '挺身而出',
          nextNodeId: 'node-5a',
          personalityImpact: { people_oriented: 5, empathy: 5, strategic: 3 }
        },
        {
          id: 'choice-4b',
          text: '"让我回去多叫些人来，人多力量大！"',
          hint: '动员更多力量',
          nextNodeId: 'node-5a',
          personalityImpact: { strategic: 5, people_oriented: 3 }
        },
        {
          id: 'choice-4c',
          text: '"任务已经完成了，我得回去照顾家人。"',
          hint: '选择退出',
          nextNodeId: 'node-5b',
          personalityImpact: { pragmatic: 3, people_oriented: -3 }
        }
      ],
      historicalContext: '淮海战役是解放战争三大战役之一，历时66天，歼灭国民党军55.5万人。陈毅元帅说："淮海战役的胜利，是人民群众用小车推出来的。"'
    },

    // ==================== 节点5a：结局（成功） ====================
    {
      id: 'node-5a',
      sceneId: '1948',
      nodeType: 'ending',
      content: `你推着弹药冲向前线，炮火在身边爆炸，但你没有停下。

当最后一箱弹药送到阵地时，战士们高喊着冲向敌军。

淮海战役，胜利了！

你站在硝烟弥漫的战场上，看着俘虏被一队队押下。你知道，你也是这场伟大胜利的一部分。

---

**历史真相**

淮海战役，1948年11月6日至1949年1月10日，历时66天。

解放军以60万对国民党军80万，最终歼敌55.5万人，创造了以少胜多的战争奇迹。

543万支前民工，88万辆独轮车，成就了这场伟大的胜利。

人民，是战争胜利的根本保证。`,
      endingType: 'success'
    },

    // ==================== 节点5b：结局（部分成功） ====================
    {
      id: 'node-5b',
      sceneId: '1948',
      nodeType: 'ending',
      content: `你完成了送粮的任务，但没有参与最后的战斗支援。

战役胜利了，你为胜利贡献了自己的力量，但心中总有一丝遗憾——也许，你可以做得更多。

---

**历史启示**

每个人都在以自己的方式为胜利做贡献。

但真正的英雄，是那些在最危险时刻挺身而出的人。`,
      endingType: 'partial'
    },

    // ==================== 节点5c：结局（失败） ====================
    {
      id: 'node-5c',
      sceneId: '1948',
      nodeType: 'ending',
      content: `你在中途放弃了任务，选择了回家。

战役依然胜利了，但你错过了参与历史的机会。多年后，你常常想：如果当时坚持一下，会怎样？

---

**历史启示**

历史是由千千万万普通人创造的。

在关键时刻的选择，决定了你成为什么样的人。`,
      endingType: 'failure'
    }
  ]
};

export default scene1948;
