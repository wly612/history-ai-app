import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReportEmail(toEmail: string, reportData: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('邮件服务未配置，请检查 .env 文件中的 SMTP 设置');
  }

  const htmlContent = `
    <h2>历史学习汇报</h2>
    <p>亲爱的家长您好：</p>
    <p>您的孩子最近完成了历史情境学习，以下是最新评测表现：</p>
    <ul>
      <li>战略力：${reportData.strategic || 0}</li>
      <li>共情力：${reportData.empathy || 0}</li>
      <li>民本观：${reportData.people_oriented || 0}</li>
      <li>缜密度：${reportData.meticulousness || 0}</li>
      <li>务实度：${reportData.pragmatic || 0}</li>
    </ul>
    <h3>AI 导师综合评语：</h3>
    <blockquote style="font-style: italic; background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
      ${reportData.ai_comments || '暂无评语'}
    </blockquote>
    <p>感谢您的关注与支持！</p>
  `;

  let info = await transporter.sendMail({
    from: `"History AI App" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "【智能历史教育】学生周报",
    text: "您的邮件客户端不支持 HTML，请使用现代客户端查看此评测报告。",
    html: htmlContent,
  });

  return info;
}
