import { Question, HistoricalNode } from '../types';

/**
 * 场景专属题库
 *
 * 每个历史场景配备5道专属题目，紧扣高考历史和场景描述的事件
 * 用户可选择想测试的场景，完成该场景的专属考核
 */

// ==================== 1937年 卢沟桥场景 ====================
export const scene1937Questions: Question[] = [
  {
    id: '1937-01',
    title: '1937年7月7日，日军制造的卢沟桥事变标志着',
    options: [
      { id: 'A', text: '中国局部抗战的开始', isCorrect: false },
      { id: 'B', text: '中国全民族抗战的开始', isCorrect: true },
      { id: 'C', text: '世界反法西斯战争的爆发', isCorrect: false },
      { id: 'D', text: '第二次国共合作的实现', isCorrect: false }
    ],
    explanation: '卢沟桥事变（七七事变）是日本全面侵华战争的开始，也是中国全民族抗战的开端。九一八事变（1931年）是局部抗战的开始；1939年德国闪击波兰是二战全面爆发；1937年9月国民党公布国共合作宣言标志第二次国共合作正式形成。',
    sceneId: '1937',
    level: 'basic'
  },
  {
    id: '1937-02',
    title: '卢沟桥事变后，第29军将士佟麟阁、赵登禹壮烈殉国。他们牺牲的地点是',
    options: [
      { id: 'A', text: '卢沟桥', isCorrect: false },
      { id: 'B', text: '北平南苑', isCorrect: true },
      { id: 'C', text: '宛平城', isCorrect: false },
      { id: 'D', text: '天津', isCorrect: false }
    ],
    explanation: '1937年7月28日，日军进攻北平南苑，第29军副军长佟麟阁、132师师长赵登禹率部抵抗，壮烈殉国。他们是抗战爆发后最早牺牲的高级将领，被追晋为陆军上将。',
    sceneId: '1937',
    level: 'basic'
  },
  {
    id: '1937-03',
    title: '七七事变后，中国共产党发表《为日军进攻卢沟桥通电》，呼吁"筑成民族统一战线的坚固长城"。这表明中国共产党',
    options: [
      { id: 'A', text: '已放弃武装斗争方针', isCorrect: false },
      { id: 'B', text: '积极推动全民族抗战', isCorrect: true },
      { id: 'C', text: '接受国民党的领导', isCorrect: false },
      { id: 'D', text: '主张与日本谈判解决争端', isCorrect: false }
    ],
    explanation: '卢沟桥事变后，中共中央立即发表通电，呼吁全民族抗战，展现了中国共产党在民族危亡时刻的责任担当。中国共产党始终没有放弃武装斗争，也未接受国民党领导，而是主张坚决抵抗日本侵略。',
    sceneId: '1937',
    level: 'medium'
  },
  {
    id: '1937-04',
    title: '佟麟阁将军在战前动员时说："战死者光荣，偷生者耻辱。国家多难，军人应当马革裹尸，以死报国。"这体现了',
    options: [
      { id: 'A', text: '传统的忠君报国思想', isCorrect: false },
      { id: 'B', text: '中华民族的爱国主义精神', isCorrect: true },
      { id: 'C', text: '个人英雄主义', isCorrect: false },
      { id: 'D', text: '军人的职业操守', isCorrect: false }
    ],
    explanation: '佟麟阁将军的誓言体现了中华民族在危亡时刻的爱国主义精神，这是抗战胜利的精神支柱。这种精神超越了传统的忠君思想，体现了现代民族国家意识，是全民族抗战的精神动力。',
    sceneId: '1937',
    level: 'medium'
  },
  {
    id: '1937-05',
    title: '从卢沟桥事变到抗战胜利，中国人民进行了长达8年的全民族抗战。这段历史给我们的启示是',
    options: [
      { id: 'A', text: '落后就要挨打，必须增强综合国力', isCorrect: true },
      { id: 'B', text: '和平可以通过妥协获得', isCorrect: false },
      { id: 'C', text: '军事力量是决定战争胜负的唯一因素', isCorrect: false },
      { id: 'D', text: '国际援助是取得胜利的根本保证', isCorrect: false }
    ],
    explanation: '卢沟桥事变的发生和抗战的艰难历程告诉我们，落后就要挨打。只有增强国家的经济、科技、军事等综合国力，才能维护国家主权和民族尊严。和平需要实力来捍卫，不能寄希望于妥协或外部援助。',
    sceneId: '1937',
    level: 'advanced'
  }
];

// ==================== 1938年 台儿庄大捷场景 ====================
export const scene1938Questions: Question[] = [
  {
    id: '1938-01',
    title: '1938年春，李宗仁指挥的台儿庄战役共歼灭日军',
    options: [
      { id: 'A', text: '5千余人', isCorrect: false },
      { id: 'B', text: '1万余人', isCorrect: true },
      { id: 'C', text: '2万余人', isCorrect: false },
      { id: 'D', text: '5万余人', isCorrect: false }
    ],
    explanation: '台儿庄战役历时近一个月，中国军队歼灭日军1万余人，是抗战以来正面战场取得的最大胜利，打破了"日军不可战胜"的神话。',
    sceneId: '1938',
    level: 'basic'
  },
  {
    id: '1938-02',
    title: '台儿庄大捷是抗战以来正面战场取得的最大胜利，指挥这场战役的是',
    options: [
      { id: 'A', text: '蒋介石', isCorrect: false },
      { id: 'B', text: '李宗仁', isCorrect: true },
      { id: 'C', text: '张自忠', isCorrect: false },
      { id: 'D', text: '薛岳', isCorrect: false }
    ],
    explanation: '李宗仁是第五战区司令长官，指挥了台儿庄战役。此役他调集兵力，采取诱敌深入、内外夹击的战术，取得重大胜利。张自忠参加了临沂保卫战，是李宗仁的部下。',
    sceneId: '1938',
    level: 'basic'
  },
  {
    id: '1938-03',
    title: '台儿庄大捷的历史意义主要在于',
    options: [
      { id: 'A', text: '彻底改变了敌强我弱的战略态势', isCorrect: false },
      { id: 'B', text: '极大地鼓舞了全国军民的抗战信心', isCorrect: true },
      { id: 'C', text: '标志着抗战进入相持阶段', isCorrect: false },
      { id: 'D', text: '是中国人民局部抗战的开始', isCorrect: false }
    ],
    explanation: '台儿庄大捷打破了"日军不可战胜"的神话，极大地鼓舞了全国军民的抗战信心，但并未改变敌强我弱的战略态势。武汉会战后抗战进入相持阶段；九一八事变是局部抗战的开始。',
    sceneId: '1938',
    level: 'medium'
  },
  {
    id: '1938-04',
    title: '台儿庄战役是徐州会战的重要组成部分。徐州会战最终的结果是',
    options: [
      { id: 'A', text: '中国军队全面胜利', isCorrect: false },
      { id: 'B', text: '中国军队主动撤退，徐州失守', isCorrect: true },
      { id: 'C', text: '日军被迫撤退', isCorrect: false },
      { id: 'D', text: '双方签订停战协定', isCorrect: false }
    ],
    explanation: '台儿庄大捷后，日军调集重兵反扑。为保存有生力量，中国军队主动撤出徐州。徐州会战虽然最终失守，但台儿庄大捷的意义在于打破了日军不可战胜的神话，振奋了全国军民士气。',
    sceneId: '1938',
    level: 'medium'
  },
  {
    id: '1938-05',
    title: '台儿庄战役中，中国军队能够取得胜利，最重要的原因是',
    options: [
      { id: 'A', text: '武器装备优于日军', isCorrect: false },
      { id: 'B', text: '将士们英勇抗敌、视死如归的精神', isCorrect: true },
      { id: 'C', text: '日军兵力严重不足', isCorrect: false },
      { id: 'D', text: '得到了大量国际援助', isCorrect: false }
    ],
    explanation: '台儿庄战役的胜利，最根本的原因是中国将士们英勇抗敌、视死如归的爱国主义精神。当时中国军队武器装备远落后于日军，日军兵力也相当充足，国际援助有限。精神力量弥补了物质劣势。',
    sceneId: '1938',
    level: 'advanced'
  }
];

// ==================== 1945年 抗战胜利场景 ====================
export const scene1945ResistanceQuestions: Question[] = [
  {
    id: '1945R-01',
    title: '1945年8月15日，日本宣布无条件投降。9月2日，日本正式签署投降书的地点是',
    options: [
      { id: 'A', text: '南京', isCorrect: false },
      { id: 'B', text: '东京', isCorrect: false },
      { id: 'C', text: '密苏里号战列舰', isCorrect: true },
      { id: 'D', text: '延安', isCorrect: false }
    ],
    explanation: '1945年9月2日，日本代表在停泊于东京湾的美军密苏里号战列舰上正式签署投降书，标志着第二次世界大战正式结束。9月9日，中国战区受降仪式在南京举行。',
    sceneId: '1945-resistance',
    level: 'basic'
  },
  {
    id: '1945R-02',
    title: '中国人民抗日战争胜利纪念日是每年的',
    options: [
      { id: 'A', text: '8月15日', isCorrect: false },
      { id: 'B', text: '9月2日', isCorrect: false },
      { id: 'C', text: '9月3日', isCorrect: true },
      { id: 'D', text: '9月9日', isCorrect: false }
    ],
    explanation: '2014年，全国人大常委会决定将9月3日确定为中国人民抗日战争胜利纪念日。9月2日是日本签署投降书的日子，9月3日是举国庆祝抗战胜利的日子。',
    sceneId: '1945-resistance',
    level: 'basic'
  },
  {
    id: '1945R-03',
    title: '抗日战争胜利的伟大历史意义在于：①彻底洗雪了近代以来的民族耻辱 ②成为中华民族由衰败到复兴的转折点 ③为世界反法西斯战争作出重大贡献 ④结束了中国半殖民地半封建社会的历史',
    options: [
      { id: 'A', text: '①②③', isCorrect: true },
      { id: 'B', text: '①②④', isCorrect: false },
      { id: 'C', text: '①③④', isCorrect: false },
      { id: 'D', text: '②③④', isCorrect: false }
    ],
    explanation: '抗战胜利是近代以来中国人民反抗外敌入侵第一次取得完全胜利，彻底洗雪了民族耻辱，是中华民族由衰败到复兴的转折点，中国是世界反法西斯战争东方主战场。但④错误，新中国成立才结束半殖民地半封建社会。',
    sceneId: '1945-resistance',
    level: 'medium'
  },
  {
    id: '1945R-04',
    title: '抗日战争能够取得胜利的根本原因是',
    options: [
      { id: 'A', text: '国际社会的有力支援', isCorrect: false },
      { id: 'B', text: '建立了抗日民族统一战线，实行全民族抗战', isCorrect: true },
      { id: 'C', text: '中国综合国力的增强', isCorrect: false },
      { id: 'D', text: '日军的战略失误', isCorrect: false }
    ],
    explanation: '抗战胜利的根本原因是建立了以国共合作为基础的抗日民族统一战线，实现了全民族抗战。国际援助是外因；当时中国仍积贫积弱；日军战略有一定失误但非主因。团结就是力量，这是最重要的经验。',
    sceneId: '1945-resistance',
    level: 'medium'
  },
  {
    id: '1945R-05',
    title: '抗日战争期间，中国军民伤亡超过3500万人。这场战争给我们的深刻启示是',
    options: [
      { id: 'A', text: '应该铭记仇恨，卧薪尝胆', isCorrect: false },
      { id: 'B', text: '珍惜和平环境，增强忧患意识，为实现中华民族伟大复兴而奋斗', isCorrect: true },
      { id: 'C', text: '军事力量决定一切', isCorrect: false },
      { id: 'D', text: '落后国家必然被侵略', isCorrect: false }
    ],
    explanation: '学习抗战史不是要延续仇恨，而是要铭记历史教训，珍惜来之不易的和平，增强忧患意识，将爱国热情转化为实现中华民族伟大复兴的实际行动。这是对抗战英烈最好的告慰。',
    sceneId: '1945-resistance',
    level: 'advanced'
  }
];

// ==================== 1945年 重庆谈判场景 ====================
export const scene1945LiberationQuestions: Question[] = [
  {
    id: '1945L-01',
    title: '1945年重庆谈判期间，国共双方签署的文件是',
    options: [
      { id: 'A', text: '《双十协定》', isCorrect: true },
      { id: 'B', text: '《停战协定》', isCorrect: false },
      { id: 'C', text: '《和平建国纲领》', isCorrect: false },
      { id: 'D', text: '《共同纲领》', isCorrect: false }
    ],
    explanation: '1945年10月10日，国共双方代表签署了《政府与中共代表会谈纪要》，即《双十协定》。但协定很快被国民党撕毁，1946年6月内战全面爆发。',
    sceneId: '1945-liberation',
    level: 'basic'
  },
  {
    id: '1945L-02',
    title: '毛泽东赴重庆谈判体现了中国共产党',
    options: [
      { id: 'A', text: '已经放弃武装斗争的方针', isCorrect: false },
      { id: 'B', text: '争取和平民主的诚意和勇气', isCorrect: true },
      { id: 'C', text: '完全认同国民党的建国方案', isCorrect: false },
      { id: 'D', text: '对美国调停的充分信任', isCorrect: false }
    ],
    explanation: '毛泽东冒着生命危险赴重庆谈判，体现了中国共产党争取和平民主的诚意和勇气。但中共并未放弃武装斗争，也未完全认同国民党的建国方案，对美国调停也保持警惕。',
    sceneId: '1945-liberation',
    level: 'basic'
  },
  {
    id: '1945L-03',
    title: '重庆谈判虽然没有阻止内战爆发，但中国共产党在政治上赢得了主动。这主要表现在',
    options: [
      { id: 'A', text: '签订了《双十协定》，确定了和平建国方针', isCorrect: false },
      { id: 'B', text: '揭穿了国民党假和平真备战的阴谋，争取了中间力量', isCorrect: true },
      { id: 'C', text: '迫使国民党承认了共产党的合法地位', isCorrect: false },
      { id: 'D', text: '实现了军队国家化', isCorrect: false }
    ],
    explanation: '重庆谈判虽然没有阻止内战，但中国共产党以极大的诚意争取和平，揭穿了国民党假和平真备战的阴谋，教育了中间人士，在政治上赢得了主动。ACD选项不符合史实。',
    sceneId: '1945-liberation',
    level: 'medium'
  },
  {
    id: '1945L-04',
    title: '重庆谈判期间，毛泽东在桂园会见了各界人士。下列说法正确的是',
    options: [
      { id: 'A', text: '谈判期间国共双方未发生任何军事冲突', isCorrect: false },
      { id: 'B', text: '国民党军队在谈判期间对解放区发动了进攻', isCorrect: true },
      { id: 'C', text: '美国完全支持中国共产党的主张', isCorrect: false },
      { id: 'D', text: '谈判达成了解放区政权问题的共识', isCorrect: false }
    ],
    explanation: '重庆谈判期间，国民党军队在上党地区对解放区发动进攻，被八路军击退。谈判在解放区政权和军队问题上未能达成共识。美国表面上调停，实际上支持国民党。',
    sceneId: '1945-liberation',
    level: 'medium'
  },
  {
    id: '1945L-05',
    title: '重庆谈判的历史经验告诉我们，处理复杂问题应该',
    options: [
      { id: 'A', text: '谈判只是形式，武力才是根本', isCorrect: false },
      { id: 'B', text: '既要争取和平，也要做好斗争准备，以斗争求和平', isCorrect: true },
      { id: 'C', text: '放弃谈判，直接使用武力', isCorrect: false },
      { id: 'D', text: '完全依赖外交途径解决', isCorrect: false }
    ],
    explanation: '重庆谈判的历史经验告诉我们，处理复杂问题要坚持斗争与谈判相结合，以斗争求和平则和平存，以妥协求和平则和平亡。这对新时代处理复杂国际问题具有重要启示。',
    sceneId: '1945-liberation',
    level: 'advanced'
  }
];

// ==================== 1948年 决战江淮场景 ====================
export const scene1948Questions: Question[] = [
  {
    id: '1948-01',
    title: '1948年9月至1949年1月，人民解放军发动的三大战役是',
    options: [
      { id: 'A', text: '淞沪、太原、徐州会战', isCorrect: false },
      { id: 'B', text: '辽沈、淮海、平津战役', isCorrect: true },
      { id: 'C', text: '济南、郑州、石家庄战役', isCorrect: false },
      { id: 'D', text: '渡江、上海、广州战役', isCorrect: false }
    ],
    explanation: '三大战役指辽沈战役（1948.9-11）、淮海战役（1948.11-1949.1）、平津战役（1948.11-1949.1），共歼灭和改编国民党军队150多万人。',
    sceneId: '1948',
    level: 'basic'
  },
  {
    id: '1948-02',
    title: '淮海战役中，支前民工达多少万人次？',
    options: [
      { id: 'A', text: '100多万', isCorrect: false },
      { id: 'B', text: '200多万', isCorrect: false },
      { id: 'C', text: '543万', isCorrect: true },
      { id: 'D', text: '800多万', isCorrect: false }
    ],
    explanation: '淮海战役期间，动员支前民工543万人次，使用担架20万副、大小车88万辆，陈毅元帅称"淮海战役的胜利是人民群众用小车推出来的"。',
    sceneId: '1948',
    level: 'basic'
  },
  {
    id: '1948-03',
    title: '"淮海战役的胜利是人民群众用小车推出来的。"这句话说明',
    options: [
      { id: 'A', text: '后勤保障是战争胜利的决定因素', isCorrect: false },
      { id: 'B', text: '人民战争是战胜敌人的重要法宝', isCorrect: true },
      { id: 'C', text: '国民党军队得不到人民支持', isCorrect: false },
      { id: 'D', text: '解放军武器装备不足', isCorrect: false }
    ],
    explanation: '陈毅元帅的话强调人民群众支援对战争胜利的重要作用，揭示了中国革命战争的重要经验——人民战争。这是中国共产党群众路线在军事领域的体现。',
    sceneId: '1948',
    level: 'medium'
  },
  {
    id: '1948-04',
    title: '三大战役的胜利，标志着',
    options: [
      { id: 'A', text: '人民解放军转入战略进攻', isCorrect: false },
      { id: 'B', text: '国民党军队的主力基本被消灭', isCorrect: true },
      { id: 'C', text: '人民解放战争取得全面胜利', isCorrect: false },
      { id: 'D', text: '国民党统治宣告结束', isCorrect: false }
    ],
    explanation: '三大战役共歼灭和改编国民党军队150多万人，国民党军队主力基本被消灭，大大加速了解放战争在全国的胜利。1947年刘邓大军挺进大别山标志转入战略进攻；渡江战役后国民党统治才宣告结束。',
    sceneId: '1948',
    level: 'medium'
  },
  {
    id: '1948-05',
    title: '淮海战役中543万民工支前，人民群众用小推车推出了胜利。这对新时代的启示是',
    options: [
      { id: 'A', text: '党员人数越多越好', isCorrect: false },
      { id: 'B', text: '必须坚持以人民为中心，始终保持同人民群众的血肉联系', isCorrect: true },
      { id: 'C', text: '只要发动群众就能解决一切问题', isCorrect: false },
      { id: 'D', text: '群众运动应该常态化', isCorrect: false }
    ],
    explanation: '淮海战役的胜利启示我们：党的力量来自人民，根基在人民、血脉在人民。新时代必须坚持以人民为中心的发展思想，践行全心全意为人民服务的宗旨，这是党长期执政的根本保证。',
    sceneId: '1948',
    level: 'advanced'
  }
];

// ==================== 1949年 开国大典场景 ====================
export const scene1949Questions: Question[] = [
  {
    id: '1949-01',
    title: '中华人民共和国成立的时间是',
    options: [
      { id: 'A', text: '1949年9月21日', isCorrect: false },
      { id: 'B', text: '1949年10月1日', isCorrect: true },
      { id: 'C', text: '1949年10月10日', isCorrect: false },
      { id: 'D', text: '1950年1月1日', isCorrect: false }
    ],
    explanation: '1949年10月1日下午3时，毛泽东在天安门城楼上庄严宣告中华人民共和国中央人民政府成立。9月21日是政协第一届全体会议开幕。',
    sceneId: '1949',
    level: 'basic'
  },
  {
    id: '1949-02',
    title: '开国大典上，54门礼炮齐鸣28响，其中"28"代表的是',
    options: [
      { id: 'A', text: '中国共产党的28位创始人', isCorrect: false },
      { id: 'B', text: '中国共产党领导人民奋斗的28年', isCorrect: true },
      { id: 'C', text: '全国28个省级行政区', isCorrect: false },
      { id: 'D', text: '出席政协会议的28个党派', isCorrect: false }
    ],
    explanation: '28响代表中国共产党从1921年成立到1949年建立新中国，领导人民奋斗的28年历程。54门礼炮代表五四运动到新中国成立的历程。',
    sceneId: '1949',
    level: 'basic'
  },
  {
    id: '1949-03',
    title: '"中国人民站起来了"的含义是',
    options: [
      { id: 'A', text: '推翻了封建帝制的统治', isCorrect: false },
      { id: 'B', text: '实现了民族独立和人民解放', isCorrect: true },
      { id: 'C', text: '建成了社会主义国家', isCorrect: false },
      { id: 'D', text: '实现了国家富强和人民幸福', isCorrect: false }
    ],
    explanation: '"中国人民站起来了"是指推翻了帝国主义、封建主义、官僚资本主义三座大山，实现了民族独立和人民解放。辛亥革命推翻了封建帝制；社会主义制度建立是1956年；"富强起来"还需长期建设。',
    sceneId: '1949',
    level: 'medium'
  },
  {
    id: '1949-04',
    title: '中国人民政治协商会议第一届全体会议的主要历史贡献是',
    options: [
      { id: 'A', text: '制定了第一部社会主义宪法', isCorrect: false },
      { id: 'B', text: '通过了《共同纲领》，为新中国的成立做了准备', isCorrect: true },
      { id: 'C', text: '完成了三大改造', isCorrect: false },
      { id: 'D', text: '确定了过渡时期总路线', isCorrect: false }
    ],
    explanation: '1949年9月政协会议通过了《共同纲领》，具有临时宪法性质；选举了中央人民政府委员会；确定了国都、国旗、国歌。1954年制定第一部宪法；1953-1956年完成三大改造。',
    sceneId: '1949',
    level: 'medium'
  },
  {
    id: '1949-05',
    title: '开国大典上，毛泽东宣布"中国人民从此站起来了"。今天，中华民族迎来了从站起来、富起来到强起来的伟大飞跃。新时代青年应该',
    options: [
      { id: 'A', text: '享受前人成果，安于现状', isCorrect: false },
      { id: 'B', text: '传承革命精神，勇担时代使命，为实现中华民族伟大复兴贡献青春力量', isCorrect: true },
      { id: 'C', text: '等待国家分配任务', isCorrect: false },
      { id: 'D', text: '只关注个人发展', isCorrect: false }
    ],
    explanation: '每一代人有每一代人的长征路。新时代青年要传承革命先辈的奋斗精神，勇担实现中华民族伟大复兴的历史使命，将个人理想融入国家发展大局，在青春赛道上跑出最好成绩。',
    sceneId: '1949',
    level: 'advanced'
  }
];

// ==================== 场景题目映射 ====================
export const sceneQuestionMap: Record<string, Question[]> = {
  '1937': scene1937Questions,
  '1938': scene1938Questions,
  '1945-resistance': scene1945ResistanceQuestions,
  '1945-liberation': scene1945LiberationQuestions,
  '1948': scene1948Questions,
  '1949': scene1949Questions
};

// ==================== 工具函数 ====================

/**
 * 获取指定场景的题目
 */
export function getQuestionsForScene(sceneId: string): Question[] {
  return sceneQuestionMap[sceneId] || [];
}

/**
 * 获取所有场景的题目统计
 */
export function getSceneQuestionStats(): { sceneId: string; count: number }[] {
  return Object.entries(sceneQuestionMap).map(([sceneId, questions]) => ({
    sceneId,
    count: questions.length
  }));
}

/**
 * 获取题库总统计
 */
export function getQuestionBankStats() {
  const total = Object.values(sceneQuestionMap).reduce((sum, questions) => sum + questions.length, 0);
  return {
    total,
    scenes: Object.keys(sceneQuestionMap).length
  };
}

// 兼容旧接口 - 生成一套试卷（从所有场景随机抽取）
export function generateQuiz(): Question[] {
  const allQuestions = Object.values(sceneQuestionMap).flat();
  return shuffleArray(allQuestions).slice(0, 5);
}

/**
 * 随机打乱数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 导出所有场景题目（兼容旧代码）
export const basicQuestions: Question[] = Object.values(sceneQuestionMap)
  .flat()
  .filter(q => q.level === 'basic');
export const mediumQuestions: Question[] = Object.values(sceneQuestionMap)
  .flat()
  .filter(q => q.level === 'medium');
export const advancedQuestions: Question[] = Object.values(sceneQuestionMap)
  .flat()
  .filter(q => q.level === 'advanced');
