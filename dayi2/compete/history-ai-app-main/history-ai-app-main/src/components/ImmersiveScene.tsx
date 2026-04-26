import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, Target, ScrollText, Loader2, Sparkles } from 'lucide-react';
import { HistoricalNode } from '../types';
import { generateSceneDescription } from '../services/geminiService';

interface ImmersiveSceneProps {
  node: HistoricalNode;
  onBack: () => void;
  onEnterScene: () => void;
}

const ImmersiveScene: React.FC<ImmersiveSceneProps> = ({ node, onBack, onEnterScene }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneDescription, setSceneDescription] = useState<string | null>(null);

  const handleEnterScene = async () => {
    setIsGenerating(true);
    const description = await generateSceneDescription(node.year, node.title, node.identity, node.mission);
    setSceneDescription(description);
    setIsGenerating(false);
    onEnterScene();
  };

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={node.image} 
          alt={node.alt}
          className={`w-full h-full object-cover opacity-30 scale-110 blur-[2px] transition-all duration-1000 ${sceneDescription ? 'opacity-10 scale-125 blur-md' : ''}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-surface/80"></div>
        <div className="film-grain opacity-40" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="absolute top-10 left-6 flex items-center gap-2 text-tertiary hover:text-primary transition-colors font-label uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> 返回档案库
        </motion.button>

        <AnimatePresence mode="wait">
          {!sceneDescription ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              {/* Scene Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center mb-16"
              >
                <div className="text-primary font-headline text-2xl italic mb-2 tracking-tighter">{node.year}</div>
                <h1 className="text-6xl md:text-8xl font-headline italic tracking-tighter text-on-surface drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                  {node.title}
                </h1>
                <div className="w-32 h-px bg-primary mx-auto mt-8 opacity-40"></div>
              </motion.div>

              {/* Identity & Mission Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Identity Card */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="bg-surface-container-highest/40 backdrop-blur-md border border-white/5 p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldAlert className="w-24 h-24 text-primary" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-primary">当前身份</span>
                  </div>
                  <h2 className="text-3xl font-headline text-on-surface mb-4 italic">{node.identity}</h2>
                  <p className="text-on-surface-variant font-body leading-relaxed opacity-80">
                    {node.context}
                  </p>
                </motion.div>

                {/* Mission Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="bg-surface-container-highest/40 backdrop-blur-md border border-white/5 p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="w-24 h-24 text-primary-container" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary-container" />
                    </div>
                    <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-primary-container">核心任务</span>
                  </div>
                  <h2 className="text-3xl font-headline text-on-surface mb-4 italic">绝密行动</h2>
                  <p className="text-on-surface-variant font-body leading-relaxed opacity-80">
                    {node.mission}
                  </p>
                </motion.div>
              </div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="mt-20"
              >
                <button 
                  onClick={handleEnterScene}
                  disabled={isGenerating}
                  className="group relative px-12 py-5 bg-primary text-on-primary font-headline italic text-xl tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {isGenerating ? (
                      <>正在重构时空 <Loader2 className="w-6 h-6 animate-spin" /></>
                    ) : (
                      <>进入场景 <ScrollText className="w-6 h-6" /></>
                    )}
                  </span>
                </button>
                <p className="text-center mt-6 text-tertiary/40 font-label text-[10px] uppercase tracking-[0.5em]">
                  {isGenerating ? '正在从档案库提取历史切片...' : '警告：历史轨迹不可逆转'}
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="description"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl bg-surface-container-high/60 backdrop-blur-xl border border-primary/20 p-12 relative"
            >
              <div className="absolute -top-6 -left-6">
                <Sparkles className="w-12 h-12 text-primary opacity-50" />
              </div>
              
              <div className="mb-8 flex items-center justify-between border-b border-primary/10 pb-4">
                <div className="font-headline italic text-primary text-xl">{node.year} · {node.title}</div>
                <div className="font-label text-[10px] uppercase tracking-widest text-tertiary">时空重构完成</div>
              </div>

              <div className="text-2xl md:text-3xl font-body leading-relaxed text-on-surface italic first-letter:text-5xl first-letter:font-headline first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                {sceneDescription}
              </div>

              <div className="mt-12 flex justify-center">
                <button 
                  onClick={onBack}
                  className="px-8 py-3 border border-primary/30 text-primary font-headline italic tracking-widest hover:bg-primary/10 transition-colors"
                >
                  结束研习
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 z-20 opacity-10 pointer-events-none">
        <div className="stamp-red rotate-12 scale-150">机密</div>
      </div>
    </div>
  );
};

export default ImmersiveScene;
