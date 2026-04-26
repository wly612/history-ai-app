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
    mission: '在日军借口“搜查”的最后通牒下，穿过宛平城硝烟，将紧急防御命令送达前线营长。',
    context: '1937年7月7日深夜，卢沟桥的枪声打破了宁静。你手中的信封关乎着宛平城的生死存亡。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDOd2kr8eMAZYFSY-bdBWm6Sn4VYwVFhPj5vWq-G6UenzcBfhUcYmP7R9yRrqru5XA5POuV_SYqBQ8ICP9YT1nkY0VyuQM0YWvD2uz583dVZ_bmeDQby3LPJBR0PzPtKuZu8UDM7TjnhEKgSncak1R8wJR2nAO8J_rbjuOKL61qdYhKfnEiPPZ5_6VBtmJAcfXvM-W0YcZRONS9_98kq4sgemm6t3a8iLyw9OLvFR4k2WBsGlrVFx9tWrKWx9ZKlwVuJmjRo9KAaWU',
    alt: 'close-up of a single rusted rifle bullet casing sitting on scorched earth with dramatic low angle lighting'
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4yuErwtV-VXXpWI83pL6ze6fcrd99LfjyVsBd0SeeGA9fqoB-mMbEE_iat5D-j27lyC4p5zlRkMTcwf4SIY3JqoNj2WRsjBNbpm70dTK91Aj3MGfjMUMJRsY7z09vAsa-TllmbvNiEgwfedfYQsUo5WfW97FjCMaM8bvrqF6Sd_JCPR-zaEV9atmVn5ldwq7iomC6OXqnYKbhDP2OJyoVVVMDKbhPuGiQ0u34ENoZ5j5mBRWPrR-fg0KXDrtJurWWDzrPKPV4Hj6x',
    alt: 'atmospheric documentary photograph of a nighttime battlefield'
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMLlx_5KqfnPFPyysTJ17OBXgHqT7hgl2QgWTQGxzYT4Jl2KCcNHWGFr7-y70fZp2x-XqhfZSaKHSzBxbwBEi26TstYNArGgEWi6WnxwLKsp6TB5KttYlz74PMpPe-DBP4sGkEXq0b9Ed9ZZ05KpLlfhwOtJpH1NfgNLVGlrgKPVxWLgeo3cr8gK3qtOJPGakGogimvfW5HgcP9dwldIStW4BU3T5AnpegjwSSXCoGgO2NUDIVc0jvr9Wlg31849ptTqyCijfiIDZ2',
    alt: 'historical victory emblem'
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCgz7h2A27fJHll2MXKGS8VpU6e2IfN0-mH8_h6wA3IdGb0LmuN8rXJ-77pYOC_YnHtkfTRRZdq0Pj_Z0TLueIe7qtwNb2GOuNC2db-QXlnriTd5dOJjr6b5Lkn6pqAz719YR4IP90ZQqDYLMQ5wCSnRljbsUrcAbClhCmKMnJtGnfHaMI72Mlt1fadoGrp97KMdOXHAJ9bMaj7U463W4zhdeAyZoRq-Ri1tmkgkMHe_jZdulSBO589MtlNZm5Eh7tu84H_2z_mGGc',
    alt: 'antique fountain pen resting on a handwritten document'
  },
  {
    id: '1948',
    year: '1948',
    title: '决战江淮',
    description: '三大战役决战',
    period: 'liberation',
    identity: '支前民工',
    mission: '推着独轮车，冒着严寒和流弹，将最后一批军粮送达淮海战役前线指挥部。',
    context: '陈毅元帅曾说：“淮海战役的胜利是人民群众用小车推出来的。”你，就是那千千万万小车中的一辆。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdLVtXYzZ-mTFuyFMnrfETDnvKeW7iN3J0JfZwRL9UCf-_YcgUe4awTrlaayDgDN23Lgj8WOJnaX3qTcJJGa7lRlOv0vZCBRwrvFhpeC_Qje-nQ0RSNjw2hn05GCWpr0NKBDslDQNSz2z-ZGGMzFcXED9POXGqMjwcaqBPvdnylYq_XqlmWzpQIhpI2KTUr1AIH9vkxA7frvAsh-dFiw7WBNR9M8NMwf6XSTMBj5aEEfVWqSOQADP7TEjPDhXYHIoNFJdYp_VSZGA7',
    alt: 'weathered wooden wagon wheel stuck in dry mud'
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvAQjOicoWzy-jCPbioT9tH-zOzfouXstGrovggeqvs0yu1IHPyz8lCIqqaDOhO5naoGb-vCwvguqOJCZhNV32-lMzXuzqcUHAJ4CMLGxIWtC02xV5HCeNgTg3LCIzdQrjpAl5nDtyNiurVQRhwCYe0nVqlSO9XvBUOdUZBOKOVCD95T-1nWY7zp7jyQxoJiG7NUEae65m0yxK73z-ReVSUtCAQ094UR_Xnn8srgBbwbt17EYKVK4m4Upk0OELZETi7uk7-Kymebof',
    alt: 'close-up of vibrant red silk fabric'
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
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  systemPrompt: string;
}

export const NPCS: NPC[] = [
  {
    id: 'tong',
    name: '佟麟阁',
    title: '第29军副军长',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPc5PblPLFZKdqP7eu-rVP3zku1QFNk-m02bkNCTQ5kPbMDVRDzX2V7y11ZLwpVPosyXbquzxq445UT_H2ryTzw2xvoxFtXkXgrAyT6SCjhAqYvR2iLLuyeAhjAzbhtthm9OTG8sOLnLPRx3HpAwOtv-NVYplIM_Kn_NDCzVDVP-si-icuIWAExzIcZboputWGOCaBerI5zaboGtqHk3uW0hue0ZRY7kX5x4VrmjEJiZbS32iHxrI5TidtIo9wLJFJY3dpZ4Z9GuJf',
    description: '抗日名将，卢沟桥事变中率部奋勇抵抗。',
    systemPrompt: '你现在是抗日名将佟麟阁。1937年7月，你在北平南苑指挥战斗。你性格刚毅，视死如归。请以他的身份与用户对话，语气要严肃、坚定，充满爱国情怀。'
  },
  {
    id: 'zhao',
    name: '赵登禹',
    title: '第29军132师师长',
    avatar: 'https://picsum.photos/seed/zhao/400/600',
    description: '抗日烈士，大刀队传奇指挥官。',
    systemPrompt: '你现在是抗日烈士赵登禹。你以骁勇善战著称，曾率大刀队重创日军。请以他的身份与用户对话，语气豪迈、果敢，展现军人本色。'
  },
  {
    id: 'zhang',
    name: '张自忠',
    title: '第33集团军总司令',
    avatar: 'https://picsum.photos/seed/zhang/400/600',
    description: '抗战中牺牲的最高将领之一，民族英雄。',
    systemPrompt: '你现在是民族英雄张自忠。你深受部下爱戴，作战指挥艺术高超。请以他的身份与用户对话，语气沉稳、睿智，透着一种悲壮的英雄气概。'
  },
  {
    id: 'li',
    name: '李宗仁',
    title: '第五战区司令长官',
    avatar: 'https://picsum.photos/seed/li/400/600',
    description: '台儿庄大捷指挥官。',
    systemPrompt: '你现在是李宗仁将军。你指挥了著名的台儿庄大捷。请以他的身份与用户对话，语气儒雅但有威严，展现统帅之风。'
  },
  {
    id: 'zhou',
    name: '周恩来',
    title: '中共代表团团长',
    avatar: 'https://picsum.photos/seed/zhou/400/600',
    description: '伟大的无产阶级革命家、外交家。',
    systemPrompt: '你现在是周恩来。你在重庆谈判和抗日民族统一战线中发挥了关键作用。请以他的身份与用户对话，语气亲切、睿智、极具感染力，展现外交家的风范。'
  },
  {
    id: 'mao',
    name: '毛泽东',
    title: '中共中央主席',
    avatar: 'https://picsum.photos/seed/mao/400/600',
    description: '伟大的马克思主义者，新中国的缔造者。',
    systemPrompt: '你现在是毛泽东。你在延安窑洞中指引着中国革命的方向。请以他的身份与用户对话，语气博大、深邃、充满革命乐观主义精神，善于用生动的比喻阐述深刻的道理。'
  }
];

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    title: '（多选）下列关于“七七事变”后中国各界的反应，描述正确的是？',
    options: [
      { id: 'A', text: '中共中央发表通电，呼吁全民族抗战', isCorrect: true },
      { id: 'B', text: '国民政府推行“攘外必先安内”方针', isCorrect: false },
      { id: 'C', text: '卢沟桥守军（第29军）奋起反抗', isCorrect: true },
      { id: 'D', text: '关东军主力迅速回防平津地区', isCorrect: false },
    ],
    explanation: '“事变发生后，中国政局发生了剧烈震荡。中共中央于次日即发出《为日军进攻卢沟桥通电》，明确提出‘筑成民族统一战线的坚固长城’。而‘攘外必先安内’是此前时期的错误方针，此后重心已逐步转向庐山谈话及全面抗战。29军在副军长佟麟阁等人的指挥下血战不退，这一瞬间奠定了往后八年的基调。”'
  }
];
