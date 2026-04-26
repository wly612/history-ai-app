import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, BarChart3, ArrowLeft, Loader2 } from 'lucide-react';
import { generateQuiz } from '../services/apiClient';

export const AssessmentScreen: React.FC<{ 
  sceneId?: string,
  onComplete: (incorrectIds: string[]) => void,
  focusQuestionId?: string,
  onBack?: () => void
}> = ({ sceneId, onComplete, focusQuestionId, onBack }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      if (focusQuestionId) return; // If retrying, ideally we'd have cached questions in AppState, but for now we'll fetch again or bypass
      try {
        setIsLoading(true);
        const fetchedQuestions = await generateQuiz(sceneId || '1937');
        if (fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        } else {
          setQuestions([{ id: 'Q1', title: '未能成功生成题目', options: [{id: 'A', text: '略', isCorrect: true}], explanation: '生成失败' }]);
        }
      } catch (e) {
        setQuestions([{ id: 'Q1', title: '网络错误, 生成题目失败', options: [{id: 'A', text: '错误', isCorrect: true}], explanation: '网络错误' }]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, [sceneId]);

  const currentQuestion = focusQuestionId && questions.length > 0
    ? questions.find(q => q.id === focusQuestionId) || questions[0]
    : questions[0];

  const handleToggleOption = (id: string) => {
    if (showReport) return;
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      setShowReport(true);
    }
  };

  const handleFinish = () => {
    if (!currentQuestion) return;
    const correctOptionIds = currentQuestion.options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
    const isCorrect = selectedOptions.length === correctOptionIds.length && 
                      selectedOptions.every(id => correctOptionIds.includes(id));
    
    const incorrectIds = isCorrect ? [] : [currentQuestion.id];
    onComplete(incorrectIds);
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="pt-32 pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-headline italic text-tertiary">正在调取历史考卷...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-10 left-6 flex items-center gap-2 text-tertiary hover:text-primary transition-colors font-label uppercase tracking-widest text-xs z-50"
        >
          <ArrowLeft className="w-4 h-4" /> 返回报告
        </button>
      )}
      
      {/* Step Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl font-headline italic tracking-tighter text-on-surface flicker-animation">战情评估考核</h2>
      </motion.div>

      {/* Central Document Card (Artifact) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-4xl p-1 bg-surface-container-highest shadow-2xl overflow-hidden"
      >
        {/* Asymmetric Parchment Background */}
        <div className="parchment-texture relative p-12 md:p-20 text-surface-dim min-h-[600px] flex flex-col">
          {/* Confidential Stamp */}
          <div className="absolute top-12 right-12 stamp-red font-bold p-3 border-4 border-double border-red-900 inline-block pointer-events-none select-none">
            <p className="text-3xl font-headline tracking-widest px-4 py-1">机密档案</p>
          </div>

          {/* Document Header */}
          <div className="mb-12 border-b border-surface-dim/20 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label text-xs uppercase tracking-widest opacity-60">档案编号：{currentQuestion.id}</p>
                <h3 className="text-3xl font-headline font-black mt-2 leading-tight max-w-xl">
                  {currentQuestion.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Clickable Options List */}
          <div className="space-y-6 mb-12">
            {currentQuestion.options.map((opt) => (
              <Option 
                key={opt.id}
                letter={opt.id === 'A' ? '甲' : opt.id === 'B' ? '乙' : opt.id === 'C' ? '丙' : '丁'} 
                text={opt.text} 
                isSelected={selectedOptions.includes(opt.id)}
                isCorrect={opt.isCorrect}
                showResult={showReport}
                onClick={() => handleToggleOption(opt.id)}
              />
            ))}
          </div>

          {/* Submit Button (Before Report) */}
          {!showReport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              className={`w-full py-4 font-headline italic text-xl tracking-widest border border-surface-dim/30 transition-all ${
                selectedOptions.length > 0 ? 'bg-surface-dim text-white opacity-100' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              提交评估请求
            </motion.button>
          )}

          {/* AI Curator Feedback */}
          <AnimatePresence>
            {showReport && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-auto pt-8 border-t border-surface-dim/20 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary-container" />
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-primary-container">档案智能分析报告</span>
                </div>
                <div className="bg-surface-dim/5 p-6 border-l-4 border-primary-container">
                  <p className="text-lg font-headline italic leading-relaxed opacity-80">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decorative Artifact Edges */}
          <div className="absolute -bottom-8 -right-8 w-64 h-64 opacity-10 pointer-events-none rotate-12">
            <img 
              alt="historical stamp" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDalPneoVxnumOUtvMkeDYNJNq3_eQ3tRl-WImKN1abVtfog7brN_Ejy915xpR1fmtUVl6R6oD_m6Cf40sRMAFrT7mY5IMCeuTJdtMx3FfnCSK1b0Stm-VAtVE68puT-So-NaSKQ7H0_RhpkOgrla_GVrYNhOQTfjSLyLIWVfBoS-Rp3F_hO6rSiXA6udAMUE3G34DH3vV32a2Mhxc6dJexwj19mSYh3OYKeEDJAj0fXdKw585Xni_mT-0lC059l23nizu3WqwXf8s"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <AnimatePresence>
        {showReport && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            className="mt-12 px-12 py-4 bg-primary-container text-on-primary-container font-headline text-xl tracking-widest uppercase shadow-xl group relative overflow-hidden"
          >
            <span className="relative z-10">进入情报摘要报告</span>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AssessmentScreen;

const Option: React.FC<{ 
  letter: string, 
  text: string, 
  isSelected: boolean,
  isCorrect: boolean,
  showResult: boolean,
  onClick: () => void 
}> = ({ letter, text, isSelected, isCorrect, showResult, onClick }) => {
  const getStatusColor = () => {
    if (!showResult) return isSelected ? 'bg-surface-dim border-surface-dim text-white' : 'border-surface-dim';
    if (isCorrect) return 'bg-green-800 border-green-800 text-white';
    if (isSelected && !isCorrect) return 'bg-red-900 border-red-900 text-white';
    return 'border-surface-dim opacity-40';
  };

  return (
    <div 
      onClick={onClick}
      className={`group flex items-start gap-6 cursor-pointer p-4 transition-all ${
        isSelected && !showResult ? 'bg-surface-dim/5' : 'hover:bg-surface-dim/5'
      } ${showResult && !isCorrect && isSelected ? 'bg-red-900/5' : ''} ${showResult && isCorrect ? 'bg-green-800/5' : ''}`}
    >
      <div className={`mt-1 w-6 h-6 border flex items-center justify-center transition-colors ${getStatusColor()}`}>
        {showResult && isCorrect && <Check className="w-4 h-4" />}
        {showResult && isSelected && !isCorrect && <X className="w-4 h-4" />}
        {!showResult && isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <p className={`text-xl font-body leading-relaxed transition-opacity ${
        showResult ? (isCorrect ? 'opacity-100 font-bold' : 'opacity-40') : 'opacity-90 group-hover:opacity-100'
      }`}>
        <span className="font-bold mr-2">{letter}.</span> {text}
      </p>
    </div>
  );
}
