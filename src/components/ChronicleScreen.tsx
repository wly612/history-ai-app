import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { HISTORICAL_NODES, HistoricalNode, AppState } from '../types';

export const ChronicleScreen: React.FC<{ 
  onNodeSelect: (node: HistoricalNode) => void,
  appState: AppState
}> = ({ onNodeSelect, appState }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 px-4 md:px-12">
      {/* Background Map Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 vignette overflow-hidden pointer-events-none">
        <img 
          className="w-full h-full object-cover filter grayscale sepia" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGczUMMYsHraMJBX_AHmwX0GQuRYy-yosDTxWkloCgrjbGRIcU08LWXD-U7IX5rA4nhFQgaQomElERfMcdrQ5cEB2xAu7FNLzC7Z9bvJvOhvrcKQuIUwFPTOjy2gkquUsuSn2IUNsLoelhcT0zX3iXwnVBa2sYz-lpLeN7np00KIjgtUoip1dhM33VRDo_t41xGhWUyVclDDvOFc0hbyMkgoUi3KqnUEZp2zYfvxdxZbY7upL4buL3Mw6LCrH_jQhfQGNbEIne2ybm"
          alt="vintage map"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-on-surface mb-4 drop-shadow-2xl">
            选择时空坐标
          </h1>
          <div className="w-24 h-px bg-primary mx-auto mb-6 opacity-30"></div>
          <p className="font-headline text-xl text-tertiary italic max-w-2xl mx-auto opacity-70">
            进入民国时空流。选择一段记忆碎片，启动历史挖掘程序。
          </p>
        </motion.div>

        {/* Bento Grid of Artifacts */}
        <div className="space-y-20">
          {/* Resistance Period */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-3xl font-headline italic text-primary">全面抗日战争时期 (1937-1945)</h2>
              <div className="flex-1 h-px bg-primary/20"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {HISTORICAL_NODES.filter(n => n.period === 'resistance').map((node, index) => (
                <ArtifactCard 
                  key={node.id} 
                  node={node} 
                  index={index} 
                  onClick={() => onNodeSelect(node)} 
                  isLearned={appState.learnedNodes.includes(node.id)}
                />
              ))}
            </div>
          </section>

          {/* Liberation Period */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-3xl font-headline italic text-primary">解放战争时期 (1945-1949)</h2>
              <div className="flex-1 h-px bg-primary/20"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {HISTORICAL_NODES.filter(n => n.period === 'liberation').map((node, index) => (
                <ArtifactCard 
                  key={node.id} 
                  node={node} 
                  index={index} 
                  onClick={() => onNodeSelect(node)} 
                  isLearned={appState.learnedNodes.includes(node.id)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer Meta Info */}
        <div className="mt-24 text-center">
          <span className="text-tertiary opacity-40 uppercase tracking-[0.4em] text-[12px] font-label">
            馆员协议 Alpha-9 // 档案修复进行中
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChronicleScreen;

const ArtifactCard: React.FC<{ 
  node: HistoricalNode, 
  index: number, 
  onClick: () => void,
  isLearned: boolean
}> = ({ node, index, onClick, isLearned }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onClick={onClick}
      className="artifact-card group relative h-[500px] bg-surface-container-highest flex flex-col shadow-2xl border-t border-white/5 cursor-pointer"
    >
      <div className="absolute top-4 left-4 z-20 text-primary font-headline text-2xl font-bold italic tracking-tighter">
        {node.year}
      </div>
      
      {isLearned && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 text-primary font-label text-[10px] uppercase tracking-widest">
          <CheckCircle2 className="w-3 h-3" /> 已研习
        </div>
      )}

      <div className="h-2/3 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 relative">
        <img 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" 
          src={node.image}
          alt={node.alt}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent"></div>
      </div>
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-on-surface text-2xl font-headline font-bold mb-2">{node.title}</h3>
          <p className="text-on-surface-variant text-sm font-body italic tracking-wide">{node.description}</p>
        </div>
        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 tracking-widest text-[12px] font-label">
          探索碎片 <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}
