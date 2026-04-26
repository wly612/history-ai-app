import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonStanding, History, CheckSquare, MessageSquare, Mail, ArrowRight, X as CloseIcon, User, MapPin, CheckCircle2, Circle, ShieldAlert, Loader2 } from 'lucide-react';
import { AppState, Screen, HISTORICAL_NODES, QUESTIONS } from '../types';
import { generateReport, sendEmailReport } from '../services/apiClient';

interface ReportScreenProps {
  appState: AppState;
  onNavigate: (screen: Screen) => void;
  onRedoQuestion: (questionId: string) => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ appState, onNavigate, onRedoQuestion }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [activeModal, setActiveModal] = useState<'nodes' | 'accuracy' | 'npcs' | 'artifact' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [stats, setStats] = useState({ strategy: 50, precision: 50, pragmatism: 50, peoplesView: 50, empathy: 50 });
  const [aiComments, setAiComments] = useState("正在生成评价...");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await generateReport();
        setStats({
          strategy: data.strategic || 50,
          empathy: data.empathy || 50,
          peoplesView: data.people_oriented || 50,
          pragmatism: data.pragmatic || 50,
          // We don't have meticulousness in radar directly mapping, we map precision to meticulousness
          precision: data.meticulousness || 50
        });
        if (data.ai_comments) setAiComments(data.ai_comments);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, []);

  const getTags = () => {
    const tags = [];
    if (stats.strategy > 70) tags.push({ text: "战略家潜质", active: true });
    if (stats.precision > 80) tags.push({ text: "细节观察者", active: true });
    if (stats.peoplesView > 70) tags.push({ text: "历史唯物主义者", active: true });
    if (stats.empathy > 70) tags.push({ text: "共情探索者", active: true });
    if (appState.learnedNodes.length === HISTORICAL_NODES.length) tags.push({ text: "全史通晓者", active: true });
    if (appState.incorrectQuestions.length === 0 && appState.learnedNodes.length > 0) tags.push({ text: "史实捍卫者", active: true });
    
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
  const accuracy = appState.incorrectQuestions.length === 0 ? 100 : Math.round((1 - appState.incorrectQuestions.length / (QUESTIONS.length || 1)) * 100);

  const handleSendArchive = async () => {
    setIsSending(true);
    try {
      const email = appState.userProfile.email || prompt("请输入接收报告的邮箱地址：");
      if (!email) {
        setIsSending(false);
        return;
      }
      await sendEmailReport(email, {
        strategic: stats.strategy,
        empathy: stats.empathy,
        people_oriented: stats.peoplesView,
        meticulousness: stats.precision,
        pragmatic: stats.pragmatism,
        ai_comments: aiComments
      });
      setToast({ message: '档案已成功加密并发送至终端', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message || '发送失败，请检查设置', type: 'error' });
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
    <div className="min-h-screen pt-28 pb-32 px-6 md:px-12 relative">
      {/* Background Vignette */}
      <div className="fixed inset-0 vignette z-[-1]"></div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 flex items-center gap-3 border shadow-2xl backdrop-blur-md ${
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
                <h2 className="text-4xl font-headline italic text-primary mb-2">{appState.userProfile.name}</h2>
                <p className="text-tertiary/60 font-label uppercase tracking-widest text-xs mb-6">档案编号：SH-1937-{appState.userProfile.registrationId.toString().padStart(4, '0')}</p>
                <div className="space-y-4 text-on-surface-variant font-body leading-relaxed">
                  <p>林书文，1915年生于上海。曾就读于圣约翰大学，主修历史与政治学。1937年抗战爆发后，毅然投身时代洪流。</p>
                  <p>在多次历史模拟情境中，林书文表现出了卓越的战略眼光和深厚的人民情怀。他擅长从纷繁复杂的历史碎片中抽丝剥茧，寻找通往未来的最优路径。</p>
                  <p>作为“档案 1937-1949”计划的核心观察对象，他的每一次抉择都为我们理解那个波澜壮阔的时代提供了独特的视角。</p>
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
              {appState.incorrectQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-headline italic text-tertiary">所有史实考核均已完美通过</p>
                </div>
              ) : (
                <>
                  <p className="text-tertiary/60 font-body italic mb-4">以下题目存在史实偏差，建议重新研习档案：</p>
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
        className="relative mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-end gap-6"
      >
        <div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-on-surface mb-4 tracking-tighter">
            学情档案：<span 
              className="text-primary cursor-pointer hover:underline decoration-primary/30 underline-offset-8 transition-all"
              onClick={() => setShowProfile(true)}
            >{appState.userProfile.name}</span>
          </h1>
          <p className="text-tertiary opacity-60 font-headline italic text-xl">情报卷宗：学号 #{appState.userProfile.registrationId.toString().padStart(4, '0')}</p>
        </div>
        <div className="relative rotate-3">
          <div className="border-2 border-primary-container px-6 py-2 text-primary-container font-bold text-lg tracking-widest uppercase font-headline">
            {appState.lastAssessmentTime || '1949年10月1日'} 归档
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary-container/10 rounded-full blur-xl"></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Panel: Personality Profile */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-high p-8 relative overflow-hidden"
          >
            <h3 className="text-on-surface-variant font-headline text-2xl mb-8 flex items-center gap-3">
              <PersonStanding className="w-6 h-6" /> 历史人格画像
            </h3>
            
            {/* Radar Chart SVG */}
            <div className="relative h-72 flex justify-center items-center mb-8">
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
              <div className="flex flex-wrap gap-2">
                {dynamicTags.map((tag, idx) => (
                  <Tag key={idx} text={tag.text} active={tag.active} />
                ))}
              </div>
            </div>
          </motion.section>

          {/* AI Comment */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-tertiary-container/10 p-8 border-l-4 border-primary-container"
          >
            <h3 className="text-primary font-headline text-xl mb-4 italic">历史导师评语 / 导师分析</h3>
            <div className="text-tertiary text-lg leading-relaxed font-body">
              {aiComments}
            </div>
          </motion.section>
        </div>

        {/* Right Panel: Stats & Viz */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              value={appState.interactedNpcs.length > 0 ? "高 (A)" : "低 (C)"} 
              label="对话交互深度" 
              subtext={`已与 ${appState.interactedNpcs.length} 位历史NPC人物进行深度互动。`} 
              onClick={() => setActiveModal('npcs')}
            />
            
            {/* Artifact Card Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setActiveModal('artifact')}
              className="bg-surface-container-highest relative overflow-hidden h-full min-h-[200px] cursor-pointer group"
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

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-auto pt-8"
          >
            <button 
              onClick={handleSendArchive}
              className="w-full group relative bg-primary-container text-on-primary-container px-10 py-6 flex items-center justify-between transition-all hover:bg-on-primary"
            >
              <div className="flex items-center gap-4">
                <Mail className="w-8 h-8" />
                <span className="text-xl font-headline font-bold tracking-widest uppercase">发送全份档案至家长/老师</span>
              </div>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
            </button>
            <p className="mt-4 text-center text-[10px] text-tertiary/30 uppercase tracking-[0.5em] font-label">
              最终档案传输协议 4.1.0
            </p>
          </motion.div>
        </div>
      </div>
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
        className="bg-surface-container-high max-w-2xl w-full p-8 md:p-12 relative border border-white/5 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-tertiary hover:text-primary transition-colors"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        {title && <h2 className="text-3xl font-headline italic text-primary mb-8">{title}</h2>}
        
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
      className="bg-surface-container-highest p-6 relative group transition-all duration-500 hover:bg-surface-bright cursor-pointer"
    >
      <div className="flex justify-between items-start mb-8">
        {icon}
        <span className="text-tertiary/30 font-label text-xs tracking-[0.3em]">DATA</span>
      </div>
      <div className="text-5xl font-headline font-bold text-on-surface mb-1">{value}</div>
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
