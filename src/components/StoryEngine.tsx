import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { StoryNode, StoryChoice, StoryState } from '../types';
import { startStory, chooseInStory, continueStory } from '../services/apiClient';

interface StoryEngineProps {
  sceneId: string;
  onComplete: () => void;
  onBack?: () => void;
}

const StoryEngine: React.FC<StoryEngineProps> = ({ sceneId, onComplete, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [progress, setProgress] = useState<StoryState | null>(null);
  const [choiceHistory, setChoiceHistory] = useState<string[]>([]);
  const [consequence, setConsequence] = useState<string>('');
  const [endingSummary, setEndingSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadInitialNode();
  }, [sceneId]);

  const loadInitialNode = async () => {
    try {
      setIsLoading(true);
      const result = await startStory(sceneId);
      setCurrentNode(result.node);
      setProgress(result.progress);
    } catch (err) {
      console.error('Failed to start story:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = async (choice: StoryChoice) => {
    if (!currentNode || !progress || isProcessing) return;

    setIsProcessing(true);
    setConsequence('');

    try {
      const result = await chooseInStory(
        sceneId,
        currentNode.id,
        choice.id,
        choiceHistory,
        progress.personalityAccumulator
      );

      // 显示过渡效果
      if (result.consequence) {
        setConsequence(result.consequence);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // 更新状态
      setCurrentNode(result.node);
      setProgress(result.progress);
      setChoiceHistory([...choiceHistory, choice.text]);

      // 如果是结局，显示总结
      if (result.node.nodeType === 'ending' && result.endingSummary) {
        setEndingSummary(result.endingSummary);
      }
    } catch (err) {
      console.error('Failed to process choice:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = async () => {
    if (!currentNode || !progress || isProcessing) return;

    setIsProcessing(true);

    try {
      const result = await continueStory(sceneId, currentNode.id, choiceHistory);

      if (result.requiresChoice) {
        // 如果下一个节点需要选择，更新当前节点
        setCurrentNode(result.node);
      } else {
        // 否则继续到下一个节点
        setCurrentNode(result.node);
        if (result.progress) {
          setProgress(result.progress);
        }
      }
    } catch (err) {
      console.error('Failed to continue:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-headline italic text-tertiary text-xl">正在重构时空...</p>
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 font-headline">剧情加载失败</p>
        <button onClick={loadInitialNode} className="mt-4 text-primary underline">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
      </div>

      {/* 返回按钮 */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-10 left-6 z-50 flex items-center gap-2 text-tertiary hover:text-primary transition-colors font-label uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> 退出场景
        </button>
      )}

      {/* 主内容区 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          {/* 过渡后果提示 */}
          {consequence && (
            <motion.div
              key="consequence"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-1/3 left-1/2 -translate-x-1/2 bg-primary-container/20 backdrop-blur-md border border-primary/30 px-8 py-4 text-center max-w-lg"
            >
              <p className="text-on-surface font-body italic text-lg">{consequence}</p>
            </motion.div>
          )}

          {/* 节点内容 */}
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl"
          >
            {/* 发言者标签 */}
            {currentNode.speakerName && currentNode.speaker !== 'narrator' && (
              <div className="mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="text-primary font-headline text-lg">
                    {currentNode.speakerName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-primary font-headline text-lg">{currentNode.speakerName}</p>
                  <p className="text-tertiary text-xs uppercase tracking-widest">
                    {currentNode.historicalContext ? '历史人物' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* 叙述者标签 */}
            {currentNode.speaker === 'narrator' && (
              <div className="mb-6 text-tertiary/60 font-label text-xs uppercase tracking-[0.3em]">
                [ 历史档案 ]
              </div>
            )}

            {/* 节点内容 */}
            <div className="bg-surface-container-high/60 backdrop-blur-md border border-white/5 p-8 md:p-12 relative">
              <p className="text-xl md:text-2xl font-body leading-relaxed text-on-surface italic whitespace-pre-wrap">
                {currentNode.content}
              </p>

              {/* 历史背景提示 */}
              {currentNode.historicalContext && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-xs text-tertiary font-label uppercase tracking-widest mb-2">
                    历史背景
                  </p>
                  <p className="text-on-surface-variant font-body text-sm">
                    {currentNode.historicalContext}
                  </p>
                </div>
              )}
            </div>

            {/* 结局总结 */}
            {currentNode.nodeType === 'ending' && endingSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-primary-container/10 border-l-4 border-primary-container p-6"
              >
                <h3 className="text-primary font-headline text-lg mb-4">历史导师点评</h3>
                <p className="text-on-surface-variant font-body leading-relaxed whitespace-pre-wrap">
                  {endingSummary}
                </p>
              </motion.div>
            )}

            {/* 选择按钮 */}
            {currentNode.choices && currentNode.choices.length > 0 && currentNode.nodeType !== 'ending' && (
              <div className="mt-8 space-y-4">
                <p className="text-tertiary/60 font-label text-xs uppercase tracking-widest mb-4">
                  选择你的行动
                </p>
                {currentNode.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleChoice(choice)}
                    disabled={isProcessing}
                    className="w-full text-left p-6 bg-surface-container-highest border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-on-surface font-body text-lg group-hover:text-primary transition-colors">
                          {choice.text}
                        </p>
                        {choice.hint && (
                          <p className="text-tertiary/50 text-xs mt-2 font-label">
                            {choice.hint}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* 结局按钮 */}
            {currentNode.nodeType === 'ending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
              >
                <button
                  onClick={onComplete}
                  className="px-12 py-4 bg-primary text-on-primary font-headline text-lg tracking-widest hover:scale-105 transition-transform"
                >
                  结束研习
                </button>
              </motion.div>
            )}

            {/* 继续按钮（用于叙述节点） */}
            {!currentNode.choices && currentNode.nodeType !== 'ending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={handleContinue}
                  disabled={isProcessing}
                  className="px-8 py-3 border border-primary/30 text-primary font-headline tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      继续
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 进度指示器 */}
        {progress && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < progress.visitedNodes.length ? 'bg-primary' : 'bg-tertiary/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryEngine;
