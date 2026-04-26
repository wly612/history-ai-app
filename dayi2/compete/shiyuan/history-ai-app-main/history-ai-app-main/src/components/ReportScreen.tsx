import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonStanding, History, CheckSquare, MessageSquare, ArrowRight, X as CloseIcon, User, CheckCircle2, Circle, ShieldAlert, Loader2, Send, ScrollText, Download } from 'lucide-react';
import { AppState, Screen, HISTORICAL_NODES, QUESTIONS } from '../types';
import { generateReport, getLearningLogs, sendDingTalkReport } from '../services/apiClient';

interface ReportScreenProps {
  appState: AppState;
  onNavigate: (screen: Screen) => void;
  onRedoQuestion: (questionId: string) => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ appState, onNavigate, onRedoQuestion }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [activeModal, setActiveModal] = useState<'nodes' | 'accuracy' | 'npcs' | 'artifact' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const isAdmin = localStorage.getItem('history-ai-admin') === 'true';
  
  const [stats, setStats] = useState({ strategy: 50, precision: 50, pragmatism: 50, peoplesView: 50, empathy: 50 });
  const [archetype, setArchetype] = useState('未定型历史人格');
  const [aiComments, setAiComments] = useState("正在生成评价...");
  const [mentorAnalysis, setMentorAnalysis] = useState("正在生成深度分析...");
  const [logCount, setLogCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<{ index: number; text: string }[]>([]);
  const [analysisSource, setAnalysisSource] = useState('');
  const [analysisWarning, setAnalysisWarning] = useState('');
  const [reportError, setReportError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalAnswered = appState.assessmentStats?.totalAnswered || 0;
  const correctAnswered = appState.assessmentStats?.correctAnswered || 0;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 0;

  useEffect(() => {
    function getReportCacheKey() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return `history-ai-report:${user.id || appState.userProfile.registrationId || appState.userProfile.name}`;
      } catch {
        return `history-ai-report:${appState.userProfile.registrationId || appState.userProfile.name}`;
      }
    }

    function buildLogSignature(logData: any) {
      const logs = Array.isArray(logData?.logs) ? logData.logs : [];
      const latest = logs[0];
      return [logData?.count || logs.length || 0, latest?.id || '', latest?.created_at || ''].join(':');
    }

    function applyReportData(data: any) {
      setStats({
        strategy: data.strategic || 50,
        empathy: data.empathy || 50,
        peoplesView: data.people_oriented || 50,
        pragmatism: data.pragmatic || 50,
        // We don't have meticulousness in radar directly mapping, we map precision to meticulousness
        precision: data.meticulousness || 50
      });
      if (data.archetype) setArchetype(data.archetype);
      if (data.ai_comments) setAiComments(data.ai_comments);
      if (data.mentor_analysis) setMentorAnalysis(data.mentor_analysis);
      setLogCount(data.log_count || 0);
      setRecentLogs(Array.isArray(data.recent_logs) ? data.recent_logs : []);
      setAnalysisSource(data.analysis_source || '');
      setAnalysisWarning(data.analysis_warning || '');
    }

    async function loadReport() {
      try {
        setReportError('');
        const cacheKey = getReportCacheKey();
        const logData = await getLearningLogs();
        const signature = buildLogSignature(logData);
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');

        if (cached?.signature === signature && cached?.report) {
          applyReportData({
            ...cached.report,
            analysis_warning: cached.report.analysis_warning || '学习记录未变化，已复用上一次画像结果。',
          });
          return;
        }

        const data = await generateReport();
        applyReportData(data);
        localStorage.setItem(cacheKey, JSON.stringify({ signature, report: data }));
      } catch (e) {
        console.error(e);
        setReportError(e instanceof Error ? e.message : '未知错误');
        setAiComments('报告暂时没有整理完成，请稍后刷新重试。');
        setMentorAnalysis(isAdmin && e instanceof Error ? e.message : '档案服务正在校验学习记录，当前暂时无法生成完整分析。');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [appState.userProfile.name, appState.userProfile.registrationId]);

  const getTags = () => {
    const tags = [];
    if (stats.strategy > 70) tags.push({ text: "战略家潜质", active: true });
    if (stats.precision > 80) tags.push({ text: "细节观察者", active: true });
    if (stats.peoplesView > 70) tags.push({ text: "历史唯物主义者", active: true });
    if (stats.empathy > 70) tags.push({ text: "共情探索者", active: true });
    if (appState.learnedNodes.length === HISTORICAL_NODES.length) tags.push({ text: "全史通晓者", active: true });
    if (totalAnswered > 0 && appState.incorrectQuestions.length === 0) tags.push({ text: "史实捍卫者", active: true });
    
    // Fallback if no specific tags
    if (tags.length === 0) tags.push({ text: "初级观察员", active: true });
    
    return tags;
  };

  const dynamicTags = getTags();

  // Helper to convert stat (0-100) to SVG coordinates
  // Center is (50, 50), Max radius is 40
  const getPoint = (value: number, angleDeg: number) => {
    const radius = (value / 100) * 40;
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: 50 + radius * Math.cos(angleRad),
      y: 50 + radius * Math.sin(angleRad)
    };
  };

  const p1 = getPoint(stats.strategy, 0);
  const p2 = getPoint(stats.precision, 72);
  const p3 = getPoint(stats.pragmatism, 144);
  const p4 = getPoint(stats.peoplesView, 216);
  const p5 = getPoint(stats.empathy, 288);

  const pointsString = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} ${p5.x},${p5.y}`;

  const learnedCount = appState.learnedNodes.length;
  const totalNodes = HISTORICAL_NODES.length;
  const archiveTime = appState.lastAssessmentTime || '尚未完成任务';
  const npcInteractionCount = appState.interactedNpcs.length;
  const npcInteractionGrade = npcInteractionCount >= 5 ? '高 (A)' : npcInteractionCount >= 2 ? '中 (B)' : '低 (C)';

  const escapeHtml = (value: string | number) => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const handleDownloadReport = () => {
    const fileSafeName = (appState.userProfile.name || '学员').replace(/[\\/:*?"<>|]/g, '_');
    const dimensions = [
      ['战略力', stats.strategy],
      ['共情力', stats.empathy],
      ['人民观', stats.peoplesView],
      ['缜密度', stats.precision],
      ['务实度', stats.pragmatism],
    ];

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>历史档案馆学情报告 - ${escapeHtml(appState.userProfile.name)}</title>
  <style>
    body {
      margin: 0;
      background: radial-gradient(circle at 20% 0%, rgba(139, 13, 16, 0.26), transparent 34%), #151312;
      color: #f4e6c8;
      font-family: "Noto Serif SC", "Songti SC", "SimSun", serif;
      line-height: 1.85;
    }
    .page {
      max-width: 980px;
      margin: 42px auto;
      padding: 52px;
      background: linear-gradient(135deg, rgba(42, 33, 31, 0.94), rgba(20, 18, 17, 0.96));
      border: 1px solid rgba(242, 167, 161, 0.22);
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
    }
    .kicker {
      color: #f2a7a1;
      letter-spacing: 0.35em;
      font-size: 12px;
      text-transform: uppercase;
    }
    h1 {
      margin: 10px 0 4px;
      font-size: 44px;
      letter-spacing: 0.08em;
      color: #ffb0aa;
      font-style: italic;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin: 32px 0;
    }
    .card {
      border: 1px solid rgba(242, 167, 161, 0.18);
      background: rgba(255, 255, 255, 0.035);
      padding: 18px;
    }
    .label {
      color: rgba(244, 230, 200, 0.52);
      font-size: 12px;
      letter-spacing: 0.18em;
    }
    .value {
      margin-top: 8px;
      color: #fff1d2;
      font-size: 20px;
      font-weight: 700;
    }
    .section {
      margin-top: 34px;
      padding-top: 26px;
      border-top: 1px solid rgba(242, 167, 161, 0.16);
    }
    h2 {
      color: #ffb0aa;
      font-size: 23px;
      font-style: italic;
      letter-spacing: 0.12em;
      margin: 0 0 18px;
    }
    .scores {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }
    .score {
      padding: 16px 12px;
      text-align: center;
      border: 1px solid rgba(242, 167, 161, 0.18);
      background: rgba(139, 13, 16, 0.12);
    }
    .score strong {
      display: block;
      color: #ffb0aa;
      font-size: 30px;
      line-height: 1.1;
    }
    .score span {
      color: rgba(244, 230, 200, 0.7);
      font-size: 13px;
    }
    .comment {
      white-space: pre-wrap;
      color: rgba(244, 230, 200, 0.9);
      font-size: 17px;
    }
    .stamp {
      display: inline-block;
      margin-top: 28px;
      border: 2px solid #b01014;
      color: #d71920;
      padding: 8px 18px;
      transform: rotate(-2deg);
      letter-spacing: 0.22em;
      font-weight: 700;
    }
    .footer {
      margin-top: 42px;
      color: rgba(244, 230, 200, 0.38);
      font-size: 12px;
      letter-spacing: 0.24em;
      text-align: center;
    }
    @media (max-width: 760px) {
      .page { margin: 0; padding: 28px; }
      .meta, .scores { grid-template-columns: 1fr; }
      h1 { font-size: 34px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="kicker">Historical Archive Report</div>
    <h1>历史档案馆学情报告</h1>
    <div class="label">最终档案传输协议 4.1.0</div>

    <section class="meta">
      <div class="card">
        <div class="label">学员</div>
        <div class="value">${escapeHtml(appState.userProfile.name)}</div>
      </div>
      <div class="card">
        <div class="label">档案编号</div>
        <div class="value">SH-1937-${escapeHtml(appState.userProfile.registrationId.toString().padStart(4, '0'))}</div>
      </div>
      <div class="card">
        <div class="label">归档时间</div>
        <div class="value">${escapeHtml(archiveTime)}</div>
      </div>
    </section>

    <section class="section">
      <h2>人格画像判定</h2>
      <div class="card">
        <div class="label">判定结果</div>
        <div class="value">${escapeHtml(archetype)}</div>
      </div>
    </section>

    <section class="section">
      <h2>五维评分</h2>
      <div class="scores">
        ${dimensions.map(([label, value]) => `
          <div class="score">
            <strong>${escapeHtml(value)}</strong>
            <span>${escapeHtml(label)}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="section">
      <h2>学习概览</h2>
      <div class="meta">
        <div class="card">
          <div class="label">已解锁时间节点</div>
          <div class="value">${escapeHtml(learnedCount)} / ${escapeHtml(totalNodes)}</div>
        </div>
        <div class="card">
          <div class="label">史实准确率</div>
          <div class="value">${escapeHtml(accuracy)}%</div>
        </div>
        <div class="card">
          <div class="label">对话交互</div>
          <div class="value">${escapeHtml(appState.interactedNpcs.length)} 位历史人物</div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>导师评语</h2>
      <div class="comment">${escapeHtml(aiComments)}</div>
    </section>

    <section class="section">
      <h2>深度分析</h2>
      <div class="comment">${escapeHtml(mentorAnalysis)}</div>
    </section>

    <div class="stamp">历史档案馆 已归档</div>
    <div class="footer">Generated by 历史档案馆 · DeepSeek Powered Archive</div>
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `历史档案馆-学情报告-${fileSafeName}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSendToDingTalk = async () => {
    setIsSending(true);
    try {
      await sendDingTalkReport({
        userName: appState.userProfile.name,
        strategic: stats.strategy,
        empathy: stats.empathy,
        people_oriented: stats.peoplesView,
        meticulousness: stats.precision,
        pragmatic: stats.pragmatism,
        ai_comments: aiComments,
        accuracy: accuracy
      });
      setToast({ message: '报告已发送到钉钉群！', type: 'success' });
    } catch (e: any) {
      setToast({ message: isAdmin ? (e.message || '发送失败，请检查设置') : '发送失败，请稍后再试。', type: 'error' });
    } finally {
      setIsSending(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-headline italic text-tertiary">正在分析潜能数据，生成报告...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-28 sm:pb-32 px-4 sm:px-6 md:px-10 xl:px-12 relative">
      {/* Background Vignette */}
      <div className="fixed inset-0 vignette z-[-1]"></div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-max px-5 sm:px-8 py-4 flex items-center gap-3 border shadow-2xl backdrop-blur-md ${
              toast.type === 'success' ? 'bg-green-900/80 border-green-500/50 text-white' : 'bg-red-900/80 border-red-500/50 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            <span className="font-headline italic tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <Modal onClose={() => setShowProfile(false)}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 bg-surface-container-highest flex items-center justify-center border border-primary/20">
                <User className="w-16 h-16 text-primary/40" />
              </div>
              <div className="flex-1">
                <h2 className="text-[clamp(1.9rem,3.4vw,2.5rem)] font-headline italic text-primary mb-2 break-words">{appState.userProfile.name}</h2>
                <p className="text-tertiary/60 font-label uppercase tracking-widest text-xs mb-6">档案编号：SH-1937-{appState.userProfile.registrationId.toString().padStart(4, '0')}</p>
                <div className="space-y-4 text-on-surface-variant font-body leading-relaxed">
                  <p>{appState.userProfile.name} 已被纳入“档案 1937-1949”计划观察序列，系统将结合你的历史对话、场景选择与答题表现持续构建画像。</p>
                  <p>当前档案会重点记录你在战略判断、人民立场、共情能力、缜密程度与务实倾向上的行为线索，并随着互动数据增加逐步修正结论。</p>
                  <p>每完成一次情景体验、人物对话或场景考核，这份卷宗都会继续补充新的证据，用于生成更准确的导师评语与人格分析。</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Unlocked Nodes Modal */}
        {activeModal === 'nodes' && (
          <Modal title="已解锁时间节点" onClose={() => setActiveModal(null)}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {HISTORICAL_NODES.map(node => {
                const isLearned = appState.learnedNodes.includes(node.id);
                return (
                  <div 
                    key={node.id} 
                    className={`p-4 border flex items-center justify-between transition-all ${
                      isLearned ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-highest/20 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center ${isLearned ? 'text-primary' : 'text-tertiary'}`}>
                        {isLearned ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="font-headline italic text-lg">{node.year} · {node.title}</div>
                        <div className="text-xs text-tertiary/60 font-label uppercase tracking-widest">{node.description}</div>
                      </div>
                    </div>
                    {isLearned ? (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 font-label uppercase tracking-widest">已研习</span>
                    ) : (
                      <button 
                        onClick={() => onNavigate('chronicle')}
                        className="text-[10px] border border-tertiary/20 text-tertiary px-2 py-1 font-label uppercase tracking-widest hover:bg-tertiary/10"
                      >
                        前往探索
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Modal>
        )}

        {/* Accuracy / Artifact Modal (Incorrect Questions) */}
        {(activeModal === 'accuracy' || activeModal === 'artifact') && (
          <Modal title={activeModal === 'accuracy' ? '史实准确度分析' : '文物复原进度'} onClose={() => setActiveModal(null)}>
            <div className="space-y-6">
              {totalAnswered === 0 ? (
                <div className="text-center py-12">
                  <ShieldAlert className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-headline italic text-tertiary">尚未完成文献评估</p>
                  <p className="mt-2 text-sm text-tertiary/60 font-body">完成任意场景题组后，这里会显示真实准确率。</p>
                </div>
              ) : appState.incorrectQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-headline italic text-tertiary">所有史实考核均已完美通过</p>
                  <p className="mt-2 text-sm text-tertiary/60 font-body">累计答对 {correctAnswered} / {totalAnswered} 题</p>
                </div>
              ) : (
                <>
                  <p className="text-tertiary/60 font-body italic mb-4">累计答对 {correctAnswered} / {totalAnswered} 题。以下题目存在史实偏差，建议重新研习档案：</p>
                  <div className="space-y-4">
                    {appState.incorrectQuestions.map(qId => {
                      const question = QUESTIONS.find(q => q.id === qId);
                      return (
                        <div key={qId} className="p-6 bg-red-900/5 border border-red-900/20 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-headline italic text-on-surface">{question?.title}</h4>
                            <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-1 font-label uppercase tracking-widest">待修正</span>
                          </div>
                          <button 
                            onClick={() => onRedoQuestion(qId)}
                            className="self-end flex items-center gap-2 text-primary hover:text-on-surface transition-colors font-label uppercase tracking-widest text-xs"
                          >
                            重新进行考核 <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}

        {/* NPC Interaction Modal */}
        {activeModal === 'npcs' && (
          <Modal title="对话交互深度" onClose={() => setActiveModal(null)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['佟麟阁', '赵登禹', '张自忠', '李宗仁', '周恩来', '毛泽东'].map(npc => {
                const interacted = appState.interactedNpcs.includes(npc);
                return (
                  <div 
                    key={npc} 
                    className={`p-4 border flex items-center gap-4 transition-all ${
                      interacted ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-highest/20 border-white/5 opacity-30'
                    }`}
                  >
                    <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center">
                      <User className={`w-6 h-6 ${interacted ? 'text-primary' : 'text-tertiary'}`} />
                    </div>
                    <div>
                      <div className="font-headline italic text-lg">{npc}</div>
                      <div className="text-[10px] text-tertiary/60 font-label uppercase tracking-widest">
                        {interacted ? '已建立深度联络' : '尚未开启对话'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 sm:mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6"
      >
        <div>
          <h1 className="text-[clamp(2.2rem,5vw,4.8rem)] font-headline font-bold text-on-surface mb-4 tracking-tighter break-words">
            学情档案：<span 
              className="text-primary cursor-pointer hover:underline decoration-primary/30 underline-offset-8 transition-all"
              onClick={() => setShowProfile(true)}
            >{appState.userProfile.name}</span>
          </h1>
          <p className="text-tertiary opacity-60 font-headline italic text-[clamp(1rem,2vw,1.25rem)]">情报卷宗：学号 #{appState.userProfile.registrationId.toString().padStart(4, '0')}</p>
        </div>
        <div className="relative rotate-3">
          <div className="border-2 border-primary-container px-6 py-2 text-primary-container font-bold text-lg tracking-widest uppercase font-headline">
            {appState.lastAssessmentTime || '尚未完成任务'} 归档
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary-container/10 rounded-full blur-xl"></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-stretch">
        {/* Left Panel: Personality Profile */}
        <div className="xl:col-span-5 flex flex-col">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-high p-8 relative overflow-hidden h-full"
          >
            <h3 className="text-on-surface-variant font-headline text-2xl mb-8 flex items-center gap-3">
              <PersonStanding className="w-6 h-6" /> 历史人格画像
            </h3>
            
            {/* Radar Chart SVG */}
            <div className="relative h-64 sm:h-72 flex justify-center items-center mb-8">
              <svg className="w-full h-full max-w-[260px]" viewBox="0 0 100 100">
                {/* Grids */}
                <polygon points="50,10 90,40 75,85 25,85 10,40" className="stroke-tertiary/10 fill-none stroke-[0.5]" />
                <polygon points="50,25 80,48 70,80 30,80 20,48" className="stroke-tertiary/10 fill-none stroke-[0.5]" />
                <polygon points="50,40 70,55 65,75 35,75 30,55" className="stroke-tertiary/10 fill-none stroke-[0.5]" />
                
                {/* Active Stats Area */}
                <motion.polygon 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  points={pointsString} 
                  className="fill-primary-container/20 stroke-primary-container stroke-[1]" 
                />
                
                {/* Points */}
                {[p1, p2, p3, p4, p5].map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.5" className="fill-primary" />
                ))}
              </svg>
              
              {/* Labels */}
              <div className="absolute top-0 text-[11px] text-tertiary font-headline italic tracking-widest">战略力</div>
              <div className="absolute top-[35%] right-0 text-[11px] text-tertiary font-headline italic tracking-widest">缜密度</div>
              <div className="absolute bottom-[5%] right-[15%] text-[11px] text-tertiary font-headline italic tracking-widest">务实度</div>
              <div className="absolute bottom-[5%] left-[15%] text-[11px] text-tertiary font-headline italic tracking-widest">人民观</div>
              <div className="absolute top-[35%] left-0 text-[11px] text-tertiary font-headline italic tracking-widest">共情力</div>
            </div>

            <div className="mt-4 p-4 bg-primary-container/5 border border-primary-container/10">
              <div className="text-on-surface-variant font-headline italic text-base mb-3">
                判定结果为：
              </div>
              <div className="mb-4 inline-flex items-center border border-primary/20 bg-primary/8 px-4 py-2 text-sm text-primary font-headline italic tracking-wide">
                {archetype}
              </div>
              <div className="flex flex-wrap gap-2">
                {dynamicTags.map((tag, idx) => (
                  <Tag key={idx} text={tag.text} active={tag.active} />
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        {/* Right Panel: Stats & Viz */}
        <div className="xl:col-span-7 h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6 h-full">
            <StatCard 
              icon={<History className="w-8 h-8 text-primary" />} 
              value={`${learnedCount} / ${totalNodes}`} 
              label="已解锁时间节点" 
              progress={(learnedCount / totalNodes) * 100} 
              onClick={() => setActiveModal('nodes')}
            />
            <StatCard 
              icon={<CheckSquare className="w-8 h-8 text-primary" />} 
              value={`${accuracy}%`} 
              label="史实准确率" 
              segments={4} 
              activeSegments={Math.round((accuracy / 100) * 4)} 
              onClick={() => setActiveModal('accuracy')}
            />
            <StatCard 
              icon={<MessageSquare className="w-8 h-8 text-primary" />} 
              value={npcInteractionGrade} 
              label="对话交互深度" 
              subtext={`已与 ${npcInteractionCount} 位历史NPC人物进行深度互动。`} 
              onClick={() => setActiveModal('npcs')}
            />
            
            {/* Artifact Card Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setActiveModal('artifact')}
              className="bg-surface-container-highest relative overflow-hidden h-full min-h-[17rem] cursor-pointer group"
            >
              <img 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAjnkATXYSkjRTaaV0sO_HZ-IKwZTVe4sFbuVThdf7oX_kGwU3G9b_Hmt3X4KbHIsPDo4iRzZo2VA_7EC524rf2hma-MucvlSo10VLVkC4lJzAZL3hcRCz2TUyU5s_VhX02DDBwBWjbN_c2PkImDP6ttS3DXRZr2p32-Qt8XsMZn-4N6e3-tva4p-Hcswr_wTHHvH-TkX416FEKFwuI836XBENYDBl0fQjKLh50d4O3HW4CZGVFPgeEXlrm8o93AoinKZbXFL_kQb9"
                alt="historical documents"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xs text-primary font-label uppercase tracking-[0.2em] mb-1">文物复原</div>
                <div className="text-xl font-headline text-on-surface italic">“往事从未真正消逝”</div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* AI Comment */}
      <motion.section 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-tertiary-container/10 p-6 sm:p-8 border-l-4 border-primary-container"
      >
        <h3 className="text-primary font-headline text-xl mb-6 italic">历史导师评语 / 导师分析</h3>
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] gap-8">
          <div>
            <div className="text-xs font-label uppercase tracking-[0.3em] text-primary/70 mb-2">导师评语</div>
            <div className="text-tertiary text-lg leading-relaxed font-body">
              {aiComments}
            </div>
          </div>
          <div>
            <div className="text-xs font-label uppercase tracking-[0.3em] text-primary/70 mb-2">深度分析</div>
            <div className="text-tertiary/80 text-base leading-relaxed font-body whitespace-pre-line">
              {mentorAnalysis}
            </div>
          </div>
        </div>

        {isAdmin && (
        <div className="mt-8 bg-surface-container-highest/50 border border-primary/10 p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-primary font-label text-xs uppercase tracking-[0.2em]">
              <ScrollText className="w-4 h-4" />
              分析证据日志
            </div>
            <div className="text-tertiary/70 font-label text-xs">
              {logCount} 条
              {analysisSource ? ` / ${analysisSource}` : ''}
            </div>
          </div>
          {reportError && (
            <p className="mb-3 text-xs text-red-300 font-body leading-relaxed">
              接口读取失败：{reportError}
            </p>
          )}
          {!reportError && analysisWarning && (
            <p className="mb-3 text-xs text-primary/80 font-body leading-relaxed">
              {analysisWarning}
            </p>
          )}
          {reportError ? (
            <p className="text-xs text-tertiary/60 font-body leading-relaxed">
              本次报告没有完成日志读取，因此这里不能判断 learning_logs 中是否有记录。请先修复 Supabase API key 后刷新报告。
            </p>
          ) : recentLogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {recentLogs.map(log => (
                <div key={log.index} className="text-xs text-tertiary/80 font-body leading-relaxed border-l border-primary/20 pl-3">
                  <span className="text-primary/70 font-label mr-2">#{log.index}</span>
                  {log.text}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-tertiary/60 font-body leading-relaxed">
              当前报告接口没有读取到 learning_logs 记录。日志保存在 Supabase 数据库的 learning_logs 表中，不在本地项目文件里。
            </p>
          )}
        </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleSendToDingTalk}
            disabled={isSending}
            className="min-h-20 group relative bg-primary text-on-primary px-6 sm:px-8 py-5 flex items-center justify-between transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            <div className="flex items-center gap-4 min-w-0">
              {isSending ? <Loader2 className="w-7 h-7 animate-spin shrink-0" /> : <Send className="w-7 h-7 shrink-0" />}
              <span className="text-lg sm:text-xl font-headline font-bold tracking-widest uppercase truncate">
                {isSending ? '发送中...' : '发送报告到钉钉群'}
              </span>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 transition-transform group-hover:translate-x-2" />
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="min-h-20 border border-primary/30 bg-surface-container-highest/70 px-6 py-5 text-primary font-headline italic tracking-widest flex items-center justify-center gap-3 hover:bg-primary/10 transition-colors"
          >
            <Download className="w-6 h-6" />
            下载报告
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-tertiary/30 uppercase tracking-[0.5em] font-label">
          最终档案传输协议 4.1.0
        </p>
      </motion.section>
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode, title?: string, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-surface-container-high max-w-2xl w-full p-5 sm:p-8 md:p-12 relative border border-white/5 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-tertiary hover:text-primary transition-colors"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        {title && <h2 className="text-[clamp(1.7rem,3vw,2.2rem)] font-headline italic text-primary mb-6 sm:mb-8 pr-10">{title}</h2>}
        
        {children}
        
        <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-primary text-on-primary font-headline italic tracking-widest hover:scale-105 transition-transform"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Tag({ text, active }: { text: string, active?: boolean, key?: React.Key }) {
  return (
    <span className={`px-4 py-1 text-sm font-label tracking-tight ${
      active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
    }`}>
      [ {text} ]
    </span>
  );
}

function StatCard({ icon, value, label, progress, segments, activeSegments, subtext, onClick }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-surface-container-highest p-6 relative group transition-all duration-500 hover:bg-surface-bright cursor-pointer h-full min-h-[17rem] flex flex-col"
    >
      <div className="flex justify-between items-start mb-8">
        {icon}
        <span className="text-tertiary/30 font-label text-xs tracking-[0.3em]">DATA</span>
      </div>
      <div className="text-[clamp(2rem,4vw,3.1rem)] font-headline font-bold text-on-surface mb-1 break-words">{value}</div>
      <div className="text-sm text-on-surface-variant font-label uppercase tracking-widest">{label}</div>
      
      {progress !== undefined && (
        <div className="mt-6 w-full h-[1px] bg-outline-variant/30 relative">
          <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      
      {segments !== undefined && (
        <div className="mt-6 flex gap-1">
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} className={`h-2 w-full ${i < activeSegments ? 'bg-primary' : 'bg-primary/20'}`}></div>
          ))}
        </div>
      )}
      
      {subtext && (
        <div className="mt-4 text-xs text-tertiary/60 italic leading-snug font-body">
          {subtext}
        </div>
      )}
    </motion.div>
  );
}

export default ReportScreen;
