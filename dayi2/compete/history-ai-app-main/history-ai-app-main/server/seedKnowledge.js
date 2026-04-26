/**
 * 知识库初始化脚本
 * 运行: node server/seedKnowledge.js
 * 
 * 这个脚本用于批量导入示例历史知识文档
 */

const sampleDocuments = [
  {
    title: "七七事变与卢沟桥抗战",
    content: "1937年7月7日夜，日军在北平西南卢沟桥附近演习时，借口一名士兵失踪，要求进入宛平县城搜查，遭到中国守军第29军严辞拒绝。日军遂向中国守军开枪射击，又炮轰宛平城。第29军奋起抗战。这就是震惊中外的七七事变，又称卢沟桥事变。七七事变是日本帝国主义全面侵华战争的开始，也是中华民族进行全面抗战的起点。第29军副军长佟麟阁、132师师长赵登禹在保卫北平的战斗中壮烈殉国。",
    source: "中国抗日战争史",
    category: "抗战历史",
    tags: ["七七事变", "卢沟桥", "佟麟阁", "赵登禹", "第29军"],
    sceneId: "1937"
  },
  {
    title: "台儿庄大捷",
    content: "台儿庄大捷，又称台儿庄战役、鲁南会战或血战台儿庄。战役从1938年3月16日开始至4月15日结束。在历时1个月的激战中，中国军队约29万人参战，日军参战人数约5万人。台儿庄大捷打击了日本侵略者的嚣张气焰，坚定了全国军民坚持抗战的信心。这是抗日战争以来取得的最大胜利。李宗仁将军是台儿庄战役的最高指挥官。",
    source: "台儿庄战役史料",
    category: "抗战历史",
    tags: ["台儿庄", "李宗仁", "正面战场", "大捷"],
    sceneId: "1938"
  },
  {
    title: "日本投降与抗战胜利",
    content: "1945年8月15日，日本天皇裕仁以广播《终战诏书》的形式，正式宣布接受波茨坦公告、无条件投降。9月2日，日本政府代表在美军密苏里号战列舰上签署投降书。9月9日，中国战区受降仪式在南京举行。中国抗日战争是近代以来中国人民反抗外敌入侵第一次取得完全胜利的民族解放战争。据统计，中国军民伤亡3500万人以上。",
    source: "中国抗日战争胜利史料",
    category: "抗战历史",
    tags: ["抗战胜利", "日本投降", "受降仪式", "南京"],
    sceneId: "1945-resistance"
  },
  {
    title: "重庆谈判与双十协定",
    content: "1945年8月28日，毛泽东在美国驻华大使赫尔利和国民党政府代表张治中的陪同下，率领中国共产党代表团从延安飞抵重庆，与国民党进行和平谈判。这就是著名的重庆谈判。经过43天的谈判，10月10日，双方签署了《政府与中共代表会谈纪要》，即《双十协定》。",
    source: "重庆谈判史料",
    category: "解放战争",
    tags: ["重庆谈判", "双十协定", "毛泽东", "和平建国"],
    sceneId: "1945-liberation"
  },
  {
    title: "淮海战役与人民群众支前",
    content: "淮海战役是解放战争三大战役之一。战役从1948年11月6日开始，至1949年1月10日结束，历时66天。解放军以60万对国民党军80万，最终歼灭国民党军55.5万人，创造了以少胜多的战争奇迹。陈毅元帅曾说过：淮海战役的胜利是人民群众用小车推出来的。",
    source: "淮海战役史料",
    category: "解放战争",
    tags: ["淮海战役", "三大战役", "支前", "陈毅", "人民群众"],
    sceneId: "1948"
  },
  {
    title: "开国大典与新中国成立",
    content: "1949年10月1日，中华人民共和国开国大典在北京天安门广场隆重举行。毛泽东主席向全世界庄严宣告：中华人民共和国中央人民政府今天成立了！下午3时，开国大典开始。毛泽东主席亲自按动电钮，第一面五星红旗在天安门广场冉冉升起。54门礼炮齐鸣28响，象征着中国共产党领导全国人民艰苦奋斗28年的光辉历程。",
    source: "开国大典史料",
    category: "新中国成立",
    tags: ["开国大典", "新中国成立", "毛泽东", "天安门", "五星红旗"],
    sceneId: "1949"
  }
];

async function importDocuments() {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  const TOKEN = process.env.ADMIN_TOKEN; // 需要有登录后的 token

  console.log('开始导入知识库文档...\n');

  for (const doc of sampleDocuments) {
    try {
      const response = await fetch(`${API_URL}/api/knowledge/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(doc)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 导入成功: ${doc.title}`);
      } else {
        const error = await response.json();
        console.log(`❌ 导入失败: ${doc.title} - ${error.error || error.message}`);
      }
    } catch (err) {
      console.log(`❌ 导入失败: ${doc.title} - ${err.message}`);
    }
    
    // 添加延迟避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n导入完成！');
}

// 显示使用说明
console.log(`
=====================================
历史知识库初始化脚本
=====================================

使用方法:
1. 先启动项目: npm run dev
2. 登录获取 token
3. 设置环境变量并运行此脚本:

   set API_URL=http://localhost:3001
   set ADMIN_TOKEN=你的登录token
   node server/seedKnowledge.js

或者直接使用 API 导入：
POST /api/knowledge/batch-import
Body: { documents: [...] }

=====================================
`);

// 如果有 token 则自动导入
if (process.env.ADMIN_TOKEN) {
  importDocuments();
}
