import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * 钉钉群机器人 Webhook 发送服务
 */

export interface DingTalkMessage {
  msgtype: string;
  [key: string]: any;
}

/**
 * 发送文本消息
 */
export async function sendDingTalkText(content: string): Promise<{ success: boolean; errcode?: number; errmsg?: string }> {
  const webhookUrl = process.env.DINGTALK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('钉钉机器人未配置，请检查 .env 文件中的 DINGTALK_WEBHOOK_URL');
  }

  const message: DingTalkMessage = {
    msgtype: 'text',
    text: {
      content: content
    }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.errcode !== 0) {
      throw new Error(result.errmsg || '发送失败');
    }

    return { success: true, errcode: result.errcode, errmsg: result.errmsg };
  } catch (error: any) {
    console.error('钉钉发送错误:', error);
    throw error;
  }
}

/**
 * 发送 Markdown 消息
 */
export async function sendDingTalkMarkdown(title: string, content: string): Promise<{ success: boolean; errcode?: number; errmsg?: string }> {
  const webhookUrl = process.env.DINGTALK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('钉钉机器人未配置，请检查 .env 文件中的 DINGTALK_WEBHOOK_URL');
  }

  const message: DingTalkMessage = {
    msgtype: 'markdown',
    markdown: {
      title: title,
      text: content
    }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.errcode !== 0) {
      throw new Error(result.errmsg || '发送失败');
    }

    return { success: true, errcode: result.errcode, errmsg: result.errmsg };
  } catch (error: any) {
    console.error('钉钉发送错误:', error);
    throw error;
  }
}

/**
 * 发送学习报告到钉钉群
 */
export async function sendReportToDingTalk(reportData: {
  userName: string;
  strategic: number;
  empathy: number;
  people_oriented: number;
  meticulousness: number;
  pragmatic: number;
  ai_comments: string;
  learnedNodes?: number;
  totalNodes?: number;
  accuracy?: number;
}): Promise<{ success: boolean }> {
  const {
    userName,
    strategic,
    empathy,
    people_oriented,
    meticulousness,
    pragmatic,
    ai_comments,
    learnedNodes = 0,
    totalNodes = 6,
    accuracy = 0
  } = reportData;

  // 计算总分
  const totalScore = Math.round((strategic + empathy + people_oriented + meticulousness + pragmatic) / 5);

  // 生成评价等级
  let grade = '需努力';
  if (totalScore >= 90) grade = '优秀';
  else if (totalScore >= 80) grade = '良好';
  else if (totalScore >= 60) grade = '及格';

  // 构建 Markdown 内容
  const markdownContent = `# 学习报告 ${userName}

## 综合评价：${grade}（${totalScore}分）

### 五维能力评估

| 维度 | 分数 | 评价 |
| --- | --- | --- |
| 战略力 | ${strategic}分 | ${strategic >= 80 ? '优秀' : strategic >= 60 ? '良好' : '需提升'} |
| 共情力 | ${empathy}分 | ${empathy >= 80 ? '优秀' : empathy >= 60 ? '良好' : '需提升'} |
| 民本观 | ${people_oriented}分 | ${people_oriented >= 80 ? '优秀' : people_oriented >= 60 ? '良好' : '需提升'} |
| 缜密度 | ${meticulousness}分 | ${meticulousness >= 80 ? '优秀' : meticulousness >= 60 ? '良好' : '需提升'} |
| 务实度 | ${pragmatic}分 | ${pragmatic >= 80 ? '优秀' : pragmatic >= 60 ? '良好' : '需提升'} |

### 学习进度

- 已解锁场景：${learnedNodes}/${totalNodes}
- 答题准确率：${accuracy}%

### AI导师评语

> ${ai_comments || '暂无评语'}

---

📅 报告时间：${new Date().toLocaleString('zh-CN')}

智能历史教育平台`;

  await sendDingTalkMarkdown('学习报告', markdownContent);

  return { success: true };
}
