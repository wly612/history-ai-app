import React from 'react';

export interface HistoricalNode {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  period: 'resistance' | 'liberation';
  identity: string;
  mission: string;
  context: string;
}

export const HISTORICAL_NODES: HistoricalNode[] = [
  {
    id: '1937',
    year: '1937',
    title: '卢沟桥',
    description: '全民族抗战爆发',
    period: 'resistance',
    identity: '第29军前线通讯员',
    mission: '在日军借口"搜查"的最后通牒下，穿过宛平城硝烟，将紧急防御命令送达前线营长。',
    context: '1937年7月7日深夜，卢沟桥的枪声打破了宁静。你手中的信封关乎着宛平城的生死存亡。',
    image: 'https://tse3.mm.bing.net/th/id/OIP.rnTXYpygFLD8qOrEaCtjBQHaLH?rs=1&pid=ImgDetMain&o=7&rm=3',
    alt: '卢沟桥历史照片'
  },
  {
    id: '1938',
    year: '1938',
    title: '台儿庄大捷',
    description: '抗战以来的重大胜利',
    period: 'resistance',
    identity: '战地记者',
    mission: '深入台儿庄巷战最前线，记录下中国军队奋勇杀敌的珍贵影像，向世界揭露侵略者的暴行。',
    context: '尸横遍野的街道上，每一块砖头都浸透了鲜血。你举起相机，快门声在炮火缝隙中响起。',
    image: 'https://tse4.mm.bing.net/th/id/OIP.8zRB4VHCsYIdx5ItLCeSDAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
    alt: '台儿庄战役历史照片'
  },
  {
    id: '1945-resistance',
    year: '1945',
    title: '抗战胜利',
    description: '日本无条件投降',
    period: 'resistance',
    identity: '受降仪式见证者',
    mission: '作为青年学生代表，在南京受降仪式现场，亲眼见证侵略者递交投降书的历史瞬间。',
    context: '八年苦战，终迎曙光。当日本代表低下头颅的那一刻，你听到了全中国人民的欢呼。',
    image: 'https://p5.img.cctvpic.com/photoworkspace/contentimg/2022/09/03/2022090312311586823.jpg',
    alt: '抗战胜利历史照片'
  },
  {
    id: '1945-liberation',
    year: '1945',
    title: '重庆谈判',
    description: '争取和平的努力',
    period: 'liberation',
    identity: '和平请愿团成员',
    mission: '在桂园门外，与成千上万的民众一起，向国共双方代表递交和平请愿书，呼吁停止内战。',
    context: '重庆的雾气中，人们的眼神里写满了对和平的渴望。你手中的请愿书，承载着亿万家庭的希望。',
    image: 'https://tse1.mm.bing.net/th/id/OIP.V_P6WfBd6aCwuU75M-aDjgHaFN?rs=1&pid=ImgDetMain&o=7&rm=3',
    alt: '重庆谈判历史照片'
  },
  {
    id: '1948',
    year: '1948',
    title: '决战江淮',
    description: '三大战役决战',
    period: 'liberation',
    identity: '支前民工',
    mission: '推着独轮车，冒着严寒和流弹，将最后一批军粮送达淮海战役前线指挥部。',
    context: '陈毅元帅曾说："淮海战役的胜利是人民群众用小车推出来的。"你，就是那千千万万小车中的一辆。',
    image: 'https://tse2.mm.bing.net/th/id/OIP.qApUFyaueFZXUKZrABo-KAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    alt: '淮海战役历史照片'
  },
  {
    id: '1949',
    year: '1949',
    title: '开国大典',
    description: '新中国诞生',
    period: 'liberation',
    identity: '天安门广场旗手',
    mission: '在万众瞩目中，护卫着第一面五星红旗，在《义勇军进行曲》中将其缓缓升起。',
    context: '1949年10月1日，北京。一个旧时代结束了，一个新时代在你的手中冉冉升起。',
    image: 'https://5b0988e595225.cdn.sohucs.com/images/20171001/b7e8852d1c474d1d904e11f4f3a6eb7b.jpeg',
    alt: '开国大典历史照片'
  }
];

export type Screen = 'chronicle' | 'dialogue' | 'assessment' | 'report';

export interface UserProfile {
  name: string;
  avatar: string;
  registrationId: number;
}

export interface AppState {
  learnedNodes: string[];
  incorrectQuestions: string[];
  interactedNpcs: string[];
  userProfile: UserProfile;
  lastAssessmentTime?: string;
}

export interface Question {
  id: string;
  title: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  sceneId?: string;
  level?: 'basic' | 'medium' | 'advanced';
}

export interface QuestionScene {
  id: string;
  title: string;
  description: string;
  year: string;
  image: string;
}

export interface QuestionBank {
  sceneId: string;
  scene: QuestionScene;
  basicQuestions: Question[];
  mediumQuestions: Question[];
  advancedQuestions: Question[];
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  // 新增字段
  lifespan: string;           // 生卒年
  birthPlace: string;         // 出生地
  achievements: string[];     // 主要成就
  famousQuote: string;        // 名言
  relatedScenes: string[];    // 相关场景
  backstory: string;          // 生平简介
}

export const NPCS: NPC[] = [
  {
    id: 'tong',
    name: '佟麟阁',
    title: '第29军副军长',
    avatar: 'https://th.bing.com/th/id/R.e412796dd7bd41832174379fe0ed0e99?rik=Awo8NLTetXN%2b%2fQ&riu=http%3a%2f%2fimg.ifeng.com%2fres%2f200712%2f1217_266977.jpg&ehk=nZNAogD2Q38Clm3wbBaUEuwDhRmr30q484vmQ8zcNlU%3d&risl=&pid=ImgRaw&r=0',
    description: '抗日名将，卢沟桥事变中率部奋勇抵抗，壮烈殉国。',
    systemPrompt: '你现在是抗日名将佟麟阁。1937年7月，你在北平南苑指挥战斗。你性格刚毅，视死如归。请以他的身份与用户对话，语气要严肃、坚定，充满爱国情怀。',
    lifespan: '1892-1937',
    birthPlace: '河北高阳',
    achievements: [
      '国民革命军第29军副军长',
      '卢沟桥事变后率部英勇抵抗',
      '南苑战斗中身先士卒，壮烈殉国',
      '追晋陆军上将，首位抗日殉国的高级将领'
    ],
    famousQuote: '战死者光荣，偷生者耻辱。国家多难，军人应当马革裹尸，以死报国。',
    relatedScenes: ['1937'],
    backstory: '佟麟阁，字捷三，河北高阳人。早年参加西北军，以骁勇善战著称。1933年率部参加长城抗战，在喜峰口战役中重创日军。1937年7月卢沟桥事变爆发，时任第29军副军长的他慷慨陈词："战死者光荣，偷生者耻辱。"7月28日，日军进攻南苑，佟麟阁亲临前线指挥作战，不幸中弹牺牲，时年45岁。他是抗战爆发后第一位殉国的高级将领。'
  },
  {
    id: 'zhao',
    name: '赵登禹',
    title: '第29军132师师长',
    avatar: 'https://th.bing.com/th/id/R.c828d0e9c97aede58abe37d4f38a9b5b?rik=XeZ5LfB0tlswPA&riu=http%3a%2f%2fjtj.pds.gov.cn%2fupload%2fimages%2f2021%2f4%2f2915019147.jpg&ehk=SemxhKQpfXVXxS7TvGtK0GRYLLTP%2ffQ8aXvO2amGCBI%3d&risl=&pid=ImgRaw&r=0',
    description: '抗日烈士，大刀队传奇指挥官，血战南苑壮烈殉国。',
    systemPrompt: '你现在是抗日烈士赵登禹。你以骁勇善战著称，曾率大刀队重创日军。请以他的身份与用户对话，语气豪迈、果敢，展现军人本色。',
    lifespan: '1898-1937',
    birthPlace: '山东菏泽',
    achievements: [
      '国民革命军第29军132师师长',
      '喜峰口战役率大刀队夜袭日军',
      '斩杀日军数百，缴获大量武器',
      '追晋陆军上将，抗日民族英雄'
    ],
    famousQuote: '军人抗战有死无生，前进！前进！',
    relatedScenes: ['1937', '1938'],
    backstory: '赵登禹，字舜诚，山东菏泽人。自幼习武，体魄强健。1933年长城抗战中，他率领大刀队在喜峰口夜袭日军营地，一战成名。此役歼敌数百，缴获步枪百余支，是"九一八"以来中国军队的首次胜利，极大鼓舞了全国军民的士气。1937年7月28日，在南苑战斗中遭日军伏击，身中数弹，壮烈殉国，时年39岁。与佟麟阁并称"卢沟桥抗战双烈"。'
  },
  {
    id: 'zhang',
    name: '张自忠',
    title: '第33集团军总司令',
    avatar: 'https://tse3.mm.bing.net/th/id/OIP.samJ7-RrB15wfj8YUdrfqQHaKT?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: '抗战中牺牲的最高将领，民族英雄，举国同悲。',
    systemPrompt: '你现在是民族英雄张自忠。你深受部下爱戴，作战指挥艺术高超。请以他的身份与用户对话，语气沉稳、睿智，透着一种悲壮的英雄气概。',
    lifespan: '1891-1940',
    birthPlace: '山东聊城',
    achievements: [
      '国民革命军第33集团军总司令',
      '临沂战役、徐州会战功勋卓著',
      '枣宜会战中亲临前线督战',
      '抗战牺牲的最高军衔将领，追晋陆军二级上将'
    ],
    famousQuote: '国家到了如此地步，除我等为其死，毫无其他办法。更相信，只要我等能本此决心，我们国家及我五千年历史之民族，决不至亡于区区三岛倭奴之手。',
    relatedScenes: ['1938'],
    backstory: '张自忠，字荩忱，山东聊城人。西北军将领，以清廉、勇猛著称。抗战爆发后，先后参加临沂保卫战、徐州会战、武汉会战等重大战役，屡建战功。1940年5月，枣宜会战中，他亲率部队渡河作战，在南瓜店遭日军重兵包围。激战中身中数弹，仍坚持指挥，最终壮烈殉国，时年49岁。他是二战中同盟国牺牲的最高军衔将领。日军发现其身份后，列队脱帽致敬。国民政府追晋其为陆军二级上将，举国同悲。'
  },
  {
    id: 'li',
    name: '李宗仁',
    title: '第五战区司令长官',
    avatar: 'https://tse4.mm.bing.net/th/id/OIP.6f0ZpDDZoMGuVNHvfVsH7gHaKD?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: '台儿庄大捷指挥官，以少胜多的抗战名将。',
    systemPrompt: '你现在是李宗仁将军。你指挥了著名的台儿庄大捷。请以他的身份与用户对话，语气儒雅但有威严，展现统帅之风。',
    lifespan: '1891-1969',
    birthPlace: '广西桂林',
    achievements: [
      '国民革命军陆军一级上将',
      '第五战区司令长官',
      '指挥台儿庄战役，歼敌万余',
      '抗战以来正面战场最大胜利'
    ],
    famousQuote: '我们要以必死的决心，与敌人决一死战！',
    relatedScenes: ['1938'],
    backstory: '李宗仁，字德邻，广西桂林人，新桂系首领。北伐战争时任国民革命军第七军军长，抗战爆发后任第五战区司令长官。1938年，他指挥台儿庄战役，以60万对日军20万，歼敌1万余人，取得了抗战以来正面战场的最大胜利，史称"台儿庄大捷"。此役打破了"日军不可战胜"的神话，极大振奋了全国军民的抗战信心。后曾任国民政府副总统、代总统。1965年从美国回到中国大陆。'
  },
  {
    id: 'zhou',
    name: '周恩来',
    title: '中共代表团团长',
    avatar: 'https://tse2.mm.bing.net/th/id/OIP.aGMbiePO8DmD03eK4CpvKwHaHW?w=1024&h=1017&rs=1&pid=ImgDetMain&o=7&rm=3',
    description: '伟大的无产阶级革命家、外交家，人民的好总理。',
    systemPrompt: '你现在是周恩来。你在重庆谈判和抗日民族统一战线中发挥了关键作用。请以他的身份与用户对话，语气亲切、睿智、极具感染力，展现外交家的风范。',
    lifespan: '1898-1976',
    birthPlace: '江苏淮安',
    achievements: [
      '中国共产党主要领导人之一',
      '西安事变和平解决的关健人物',
      '重庆谈判中共代表团团长',
      '新中国第一任国务院总理'
    ],
    famousQuote: '为中华之崛起而读书。',
    relatedScenes: ['1945-resistance', '1945-liberation', '1949'],
    backstory: '周恩来，字翔宇，江苏淮安人。早年留学法国，参与创建中国共产党。长征途中在遵义会议上支持毛泽东，确立了毛泽东的领导地位。抗战期间，常驻重庆，负责抗日民族统一战线工作。1945年重庆谈判中，作为中共代表团团长，与国民党进行艰难谈判，展现了卓越的外交智慧。新中国成立后，长期担任国务院总理，被誉为"人民的好总理"。其人格魅力、外交风采，赢得了国内外广泛尊敬。'
  },
  {
    id: 'mao',
    name: '毛泽东',
    title: '中共中央主席',
    avatar: 'https://img.rednet.cn/2018/12-26/f5039e09-74f8-4440-8635-67caa98b2baa.jpg',
    description: '伟大的马克思主义者，新中国的缔造者。',
    systemPrompt: '你现在是毛泽东。你在延安窑洞中指引着中国革命的方向。请以他的身份与用户对话，语气博大、深邃、充满革命乐观主义精神，善于用生动的比喻阐述深刻的道理。',
    lifespan: '1893-1976',
    birthPlace: '湖南湘潭',
    achievements: [
      '中国共产党、中国人民解放军、中华人民共和国的主要缔造者',
      '《论持久战》指明抗战胜利方向',
      '领导中国人民取得抗战胜利',
      '建立中华人民共和国'
    ],
    famousQuote: '为人民服务。',
    relatedScenes: ['1945-liberation', '1949'],
    backstory: '毛泽东，字润之，湖南湘潭人。中国共产党、中国人民解放军和中华人民共和国的主要缔造者。抗战期间，发表《论持久战》，科学预见了抗战的三个阶段，坚定了全国人民的必胜信念。在延安领导全党开展整风运动，确立了实事求是的思想路线。1945年重庆谈判，置个人安危于度外，亲赴重庆，赢得政治主动。1949年10月1日，在天安门城楼上庄严宣告中华人民共和国成立。他的军事思想、哲学著作影响深远。'
  }
];

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    title: '(多选)下列关于"七七事变"后中国各界的反应，描述正确的是？',
    options: [
      { id: 'A', text: '中共中央发表通电，呼吁全民族抗战', isCorrect: true },
      { id: 'B', text: '国民政府推行"攘外必先安内"方针', isCorrect: false },
      { id: 'C', text: '卢沟桥守军(第29军)奋起反抗', isCorrect: true },
      { id: 'D', text: '关东军主力迅速回防平津地区', isCorrect: false },
    ],
    explanation: '"事变发生后，中国政局发生了剧烈震荡。中共中央于次日即发出《为日军进攻卢沟桥通电》，明确提出"筑成民族统一战线的坚固长城"。而"攘外必先安内"是此前时期的错误方针，此后重心已逐步转向庐山谈话及全面抗战。29军在副军长佟麟阁等人的指挥下血战不退，这一瞬间奠定了往后八年的基调。"'
  }
];

// ==================== 场景剧情系统类型 ====================

// 剧情节点类型
export type StoryNodeType = 'narrative' | 'dialogue' | 'choice' | 'encounter' | 'ending';

// 选择项
export interface StoryChoice {
  id: string;
  text: string;
  hint?: string;
  nextNodeId?: string;
  personalityImpact?: {
    strategic?: number;
    empathy?: number;
    people_oriented?: number;
    meticulousness?: number;
    pragmatic?: number;
  };
}

// 剧情节点
export interface StoryNode {
  id: string;
  sceneId: string;
  nodeType: StoryNodeType;
  content: string;
  speaker?: string;
  speakerName?: string;
  choices?: StoryChoice[];
  historicalContext?: string;
  endingType?: 'success' | 'partial' | 'failure';
  aiPromptHint?: string;
}

// 用户剧情状态(运行时)
export interface StoryState {
  sceneId: string;
  currentNodeId: string;
  visitedNodes: string[];
  choices: { nodeId: string; choiceId: string }[];
  personalityAccumulator: {
    strategic: number;
    empathy: number;
    people_oriented: number;
    meticulousness: number;
    pragmatic: number;
  };
}

// 场景剧本配置
export interface SceneScript {
  sceneId: string;
  title: string;
  description: string;
  nodes: StoryNode[];
  startNodeId: string;
  endingNodes: string[];
}

// AI 生成的剧情内容
export interface GeneratedStoryContent {
  nodeContent: string;
  consequence?: string;
  npcDialogue?: string;
}
