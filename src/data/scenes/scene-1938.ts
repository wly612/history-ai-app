import { SceneScript } from '../../types';

/**
 * 1938年 台儿庄大捷 场景剧本
 *
 * 身份：战地记者
 * 任务：记录中国军队奋勇杀敌的珍贵影像
 */

export const scene1938: SceneScript = {
  sceneId: '1938',
  title: '台儿庄大捷',
  description: '抗战以来的重大胜利',
  startNodeId: 'node-1',
  endingNodes: ['node-5a', 'node-5b', 'node-5c'],

  nodes: [
    // ==================== 节点1：开场叙述 ====================
    {
      id: 'node-1',
      sceneId: '1938',
      nodeType: 'narrative',
      content: `1938年春，山东台儿庄。

你是一名战地记者，背着相机，跟随中国军队进入这个注定要被历史铭记的小城。

尸横遍野的街道上，每一块砖头都浸透了鲜血。远处，炮火声此起彼伏，日军的进攻一波接一波。

"记者同志，这里危险！"一名军官冲你喊道，"但如果你能记录下这一切，让世界看到侵略者的暴行，那就是对国家最大的贡献！"

你握紧了相机，准备深入最前线...`,
      speaker: 'narrator'
    },

    // ==================== 节点2：遭遇事件 ====================
    {
      id: 'node-2',
      sceneId: '1938',
      nodeType: 'encounter',
      content: `你跟随一队士兵穿过巷道，突然前方传来激烈的枪声。

"鬼子在前面！"士兵们迅速散开，寻找掩体。

你看到一名日军狙击手正在一栋半塌的建筑里射击。旁边是一条通往侧翼的小路，可以绕过去；另一边是一群准备冲锋的中国士兵。

作为战地记者，你必须决定如何行动...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-2a',
          text: '跟随士兵冲锋，记录正面战斗',
          hint: '危险但能拍到震撼画面',
          nextNodeId: 'node-3a',
          personalityImpact: { strategic: 3, empathy: 5 }
        },
        {
          id: 'choice-2b',
          text: '绕道侧翼，寻找独特视角',
          hint: '安全但可能错过关键画面',
          nextNodeId: 'node-3b',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        },
        {
          id: 'choice-2c',
          text: '寻找高地，俯瞰整个战场',
          hint: '全面但距离较远',
          nextNodeId: 'node-3a',
          personalityImpact: { strategic: 5, people_oriented: 3 }
        }
      ]
    },

    // ==================== 节点3a：对话（正面战场） ====================
    {
      id: 'node-3a',
      sceneId: '1938',
      nodeType: 'dialogue',
      content: `你冒着枪林弹雨前进，相机记录下了中国士兵英勇奋战的画面。

在一处临时指挥所，你见到了李宗仁将军——这场战役的最高指挥官。

"记者同志，你来得正好！"李宗仁看着你拍下的照片，神色凝重，"这些影像，要让全世界都看到！"

他转向你，语气变得更加严肃：

"台儿庄战役，我们已经打了十几天。日军矶谷师团和板垣师团主力都在这里。你说，我们应该怎么打才能彻底击溃他们？"`,
      speaker: 'li',
      speakerName: '李宗仁',
      choices: [
        {
          id: 'choice-3a-1',
          text: '"将军，应该集中优势兵力，从侧翼包抄，断其后路！"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 5, people_oriented: 3 }
        },
        {
          id: 'choice-3a-2',
          text: '"应该稳扎稳打，消耗日军有生力量，再图反击。"',
          nextNodeId: 'node-4',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        }
      ],
      historicalContext: '李宗仁（1891-1969），著名抗日将领，第五战区司令长官。台儿庄大捷是他指挥的最著名战役，历时1个月，歼敌1万余人。'
    },

    // ==================== 节点3b：对话（侧翼视角） ====================
    {
      id: 'node-3b',
      sceneId: '1938',
      nodeType: 'dialogue',
      content: `你绕到侧翼，从独特角度记录了战斗场面。

在那里，你遇到了一名年轻的连长，他正带领士兵坚守一个关键路口。

"记者同志，帮我们拍张照吧！"他笑着擦了擦脸上的血迹，"说不定这是我们最后的合影了。"

他的乐观感染了你。他继续说道：

"听连里老兵说，日军最怕我们的夜袭。你觉得，我们今晚要不要给鬼子来个突袭？"`,
      speaker: 'narrator',
      speakerName: '连长',
      choices: [
        {
          id: 'choice-3b-1',
          text: '"当然！出其不意，攻其不备！"',
          nextNodeId: 'node-4',
          personalityImpact: { strategic: 3, empathy: 5 }
        },
        {
          id: 'choice-3b-2',
          text: '"先观察敌情，确认弱点再行动。"',
          nextNodeId: 'node-4',
          personalityImpact: { meticulousness: 5, strategic: 3 }
        }
      ],
      historicalContext: '台儿庄战役中，中国军队多次发动夜袭，打乱了日军的部署，是取得胜利的重要因素之一。'
    },

    // ==================== 节点4：关键抉择 ====================
    {
      id: 'node-4',
      sceneId: '1938',
      nodeType: 'choice',
      content: `战斗进入最后阶段，日军已是强弩之末。

你面前有两个重要画面可以拍摄：
一处是即将发起总攻的中国军队，这将是最激动人心的冲锋画面；
另一处是被战火波及的平民废墟，那里有无辜百姓的遗体。

作为战地记者，你的镜头决定了世界将看到什么样的战争...`,
      speaker: 'narrator',
      choices: [
        {
          id: 'choice-4a',
          text: '记录胜利的冲锋，展现中国军队的英雄气概',
          hint: '鼓舞士气',
          nextNodeId: 'node-5a',
          personalityImpact: { strategic: 5, people_oriented: 5 }
        },
        {
          id: 'choice-4b',
          text: '记录战争的残酷，揭露侵略者的暴行',
          hint: '震撼人心',
          nextNodeId: 'node-5b',
          personalityImpact: { empathy: 5, meticulousness: 3 }
        },
        {
          id: 'choice-4c',
          text: '两者都要记录，完整呈现战争的全貌',
          hint: '全面客观',
          nextNodeId: 'node-5a',
          personalityImpact: { meticulousness: 5, pragmatic: 3 }
        }
      ],
      historicalContext: '台儿庄大捷是抗战以来正面战场取得的最大胜利，歼灭日军1万余人，极大地鼓舞了全国军民的抗战信心。'
    },

    // ==================== 节点5a：结局（成功） ====================
    {
      id: 'node-5a',
      sceneId: '1938',
      nodeType: 'ending',
      content: `你的照片登上了各大报纸的头版。

冲锋的士兵、飘扬的军旗、胜利的欢呼——这些画面让全世界看到了中国军队的英勇，也让国内民众看到了抗战胜利的希望。

台儿庄大捷，歼敌万余，是抗战以来最辉煌的胜利。你用镜头记录的历史，将永远被铭记。

---

**历史真相**

1938年3月至4月，台儿庄战役历时1个月，中国军队约29万人参战，日军约5万人。

最终歼灭日军1万余人，是抗战以来正面战场取得的最大胜利。李宗仁将军的指挥艺术，以及中国将士的英勇奋战，共同铸就了这一辉煌战果。`,
      endingType: 'success'
    },

    // ==================== 节点5b：结局（部分成功） ====================
    {
      id: 'node-5b',
      sceneId: '1938',
      nodeType: 'ending',
      content: `你选择记录战争的残酷一面。

废墟、遗体、流离失所的难民——这些画面震惊了世界，揭露了日本侵略者的暴行。但也有人质疑，这样的画面是否会打击民众的抗战信心。

最终，你明白了一个道理：战争从来不只是数字和胜负，每一个生命都值得被铭记。

---

**历史启示**

台儿庄战役期间，约有数万平民伤亡。战争的代价，永远是由普通百姓承担最多。

记录真相，是对历史最好的尊重。`,
      endingType: 'partial'
    },

    // ==================== 节点5c：结局（失败） ====================
    {
      id: 'node-5c',
      sceneId: '1938',
      nodeType: 'ending',
      content: `你在战场上犹豫太久，错过了关键的拍摄时机。

虽然战役取得了胜利，但你的镜头没有留下足够的记录。那些英勇的瞬间、那些感人的画面，都随风而逝。

你懊悔不已，但也学到了宝贵一课：机会稍纵即逝，历史不等人。

---

**历史启示**

战地记者冒着生命危险记录真相，他们的勇气和牺牲同样值得铭记。

每一张照片背后，都是对历史的责任。`,
      endingType: 'failure'
    }
  ]
};

export default scene1938;
