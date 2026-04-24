import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, BarChart3, ArrowLeft, ArrowRight, Trophy, BookOpen, RefreshCw, Target, ShieldAlert } from 'lucide-react';
import { getQuestionsForScene, getQuestionBankStats, sceneQuestionMap } from '../data/questions';
import { HISTORICAL_NODES } from '../types';

interface Question {
  id: string;
  title: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  sceneId?: string;
  level?: 'basic' | 'medium' | 'advanced';
}

interface AnswerRecord {
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean;
}

interface AssessmentScreenProps {
  sceneId?: string;
  onComplete: (incorrectIds: string[]) => void;
  onBack?: () => void;
}

export const AssessmentScreen: React.FC<AssessmentScreenProps> = ({ sceneId: propSceneId, onComplete, onBack }) => {
  // 如果传入了sceneId，直接进入该场景的测试
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(propSceneId || null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<'select' | 'quiz' | 'result'>(propSceneId ? 'quiz' : 'select');

  // 获取题库统计
  const stats = getQuestionBankStats();

  // 获取场景信息
  const getSceneInfo = (id: string) => {
    return HISTORICAL_NODES.find(n => n.id === id);
  };

  // 开始指定场景的测试
  const handleStartSceneQuiz = (sceneId: string) => {
    const sceneQuestions = getQuestionsForScene(sceneId);
    if (sceneQuestions.length === 0) {
      alert('该场景暂无题目');
      return;
    }
    setSelectedSceneId(sceneId);
    setQuestions(sceneQuestions);
    setCurrentIndex(0);
    setSelectedOptions([]);
    setShowReport(false);
    setAnswers([]);
    setPhase('quiz');
  };

  // 重新开始
  const handleRetry = () => {
    if (selectedSceneId) {
      handleStartSceneQuiz(selectedSceneId);
    }
  };

  // 返回场景选择
  const handleBackToSelect = () => {
    setSelectedSceneId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOptions([]);
    setShowReport(false);
    setAnswers([]);
    setPhase('select');
  };

  const currentQuestion = questions[currentIndex];

  // 判断是否多选题
  const isMultipleChoice = (q: Question) => {
    return q.options.filter(o => o.isCorrect).length > 1;
  };

  const handleToggleOption = (id: string) => {
    if (showReport) return;

    if (!isMultipleChoice(currentQuestion)) {
      setSelectedOptions([id]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || selectedOptions.length === 0) return;

    const correctOptionIds = currentQuestion.options.filter(o => o.isCorrect).map(o => o.id);
    const isCorrect = selectedOptions.length === correctOptionIds.length &&
                      selectedOptions.every(id => correctOptionIds.includes(id));

    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedOptions,
      isCorrect
    }]);

    setShowReport(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptions([]);
      setShowReport(false);
    } else {
      setPhase('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevAnswer = answers[currentIndex - 1];
      if (prevAnswer) {
        setSelectedOptions(prevAnswer.selectedOptions);
        setShowReport(true);
      } else {
        setSelectedOptions([]);
        setShowReport(false);
      }
    }
  };

  const handleFinish = () => {
    const incorrectIds = answers.filter(a => !a.isCorrect).map(a => a.questionId);
    onComplete(incorrectIds);
  };

  // 计算得分
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // 当前答题是否正确
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const isCurrentCorrect = currentAnswer?.isCorrect ?? false;

  // 当前场景信息
  const currentScene = selectedSceneId ? getSceneInfo(selectedSceneId) : null;

  // ==================== 场景选择页面 ====================
  if (phase === 'select') {
    return (
      <div className="min-h-screen pt-24 pb-24 px-6">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-10 left-6 flex items-center gap-2 text-tertiary hover:text-primary transition-colors font-label uppercase tracking-widest text-xs z-50"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* 标题 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-5xl md:text-6xl font-headline italic tracking-tighter text-on-surface">文献评估</h1>
            </div>
            <p className="text-tertiary font-headline italic text-lg opacity-60">选择场景，开启专属考核</p>
          </div>

          {/* 说明卡片 */}
          <div className="bg-surface-container-highest border border-white/5 p-6 mb-8">
            <div className="flex items-center gap-4">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <p className="text-on-surface font-body">每个历史场景配备 <span className="text-primary font-bold">5 道专属题目</span>，紧扣场景事件与高考考点</p>
                <p className="text-sm text-tertiary font-body mt-1">选择你想测试的场景，完成考核后可查看详细报告</p>
              </div>
            </div>
          </div>

          {/* 场景选择网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {HISTORICAL_NODES.map((node, index) => {
              const questionCount = sceneQuestionMap[node.id]?.length || 0;
              const isAvailable = questionCount > 0;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => isAvailable && handleStartSceneQuiz(node.id)}
                  className={`group relative bg-surface-container-highest border border-white/5 overflow-hidden cursor-pointer transition-all ${
                    isAvailable ? 'hover:border-primary/30 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* 年份标签 */}
                  <div className="absolute top-3 left-3 z-10 text-primary font-headline text-lg font-bold italic">
                    {node.year}
                  </div>

                  {/* 图片 */}
                  <div className="h-32 overflow-hidden relative">
                    <img
                      src={node.image}
                      alt={node.alt}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent" />
                  </div>

                  {/* 内容 */}
                  <div className="p-5">
                    <h3 className="text-on-surface text-xl font-headline mb-2">{node.title}</h3>
                    <p className="text-on-surface-variant text-sm font-body italic opacity-80 mb-3">{node.description}</p>

                    {/* 题目数量 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        <span className="text-sm font-label text-primary">
                          {questionCount} 道题目
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 提示 */}
          <div className="text-center">
            <p className="text-xs text-tertiary font-label">
              每个场景5道题目，包含基础题、中档题、高档题，对标高考难度
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==================== 结果页面 ====================
  if (phase === 'result') {
    return (
      <div className="pt-20 pb-20 px-6 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-surface-container-highest border border-white/5 p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                score >= 60 ? 'bg-primary/10' : 'bg-red-500/10'
              }`}>
                <Trophy className={`w-10 h-10 ${score >= 60 ? 'text-primary' : 'text-red-500'}`} />
              </div>
              <h2 className="text-3xl font-headline italic text-on-surface mb-2">考核完成</h2>
              {currentScene && (
                <p className="text-tertiary font-headline text-sm">{currentScene.year} · {currentScene.title}</p>
              )}
            </div>

            {/* 分数 */}
            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" />
                  <circle
                    cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * score / 100)}
                    className={score >= 60 ? 'text-primary' : 'text-red-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-headline font-bold ${score >= 60 ? 'text-primary' : 'text-red-500'}`}>
                    {score}
                  </span>
                  <span className="text-xs text-tertiary font-label">分</span>
                </div>
              </div>
            </div>

            {/* 评价 */}
            <div className="text-center mb-8 p-4 bg-surface-container">
              <p className="font-body text-on-surface-variant">
                {score >= 80 && '优秀！您对该场景历史知识掌握扎实！'}
                {score >= 60 && score < 80 && '良好！建议复习错题，巩固知识。'}
                {score < 60 && '需加强！建议重新学习该场景内容。'}
              </p>
            </div>

            {/* 统计 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-surface-container">
                <div className="text-2xl font-headline text-on-surface">{totalQuestions}</div>
                <div className="text-xs text-tertiary font-label uppercase">总题数</div>
              </div>
              <div className="text-center p-4 bg-surface-container">
                <div className="text-2xl font-headline text-green-500">{correctCount}</div>
                <div className="text-xs text-tertiary font-label uppercase">答对</div>
              </div>
              <div className="text-center p-4 bg-surface-container">
                <div className="text-2xl font-headline text-red-500">{totalQuestions - correctCount}</div>
                <div className="text-xs text-tertiary font-label uppercase">答错</div>
              </div>
            </div>

            {/* 答题详情 */}
            <div className="mb-8">
              <h3 className="text-sm font-label uppercase tracking-widest text-tertiary mb-4">答题详情</h3>
              <div className="flex justify-center gap-2">
                {questions.map((q, index) => {
                  const answer = answers.find(a => a.questionId === q.id);
                  return (
                    <div
                      key={q.id}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-label ${
                        answer?.isCorrect
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                          : 'bg-red-500/20 text-red-500 border border-red-500/30'
                      }`}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBackToSelect}
                className="flex-1 py-4 border border-primary/30 font-headline italic text-lg tracking-widest text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                选择其他场景
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 py-4 bg-primary text-on-primary font-headline italic text-lg tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                再测一次
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-4 bg-surface-container text-on-surface font-headline italic text-lg tracking-widest hover:bg-surface-container-high transition-colors"
              >
                查看报告
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==================== 答题页面 ====================
  return (
    <div className="pt-16 pb-16 px-4 md:px-6 flex flex-col items-center min-h-screen">
      {/* 顶部 */}
      <div className="w-full max-w-4xl mb-4">
        <button
          onClick={handleBackToSelect}
          className="flex items-center gap-2 text-tertiary hover:text-primary transition-colors font-label uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> 返回场景选择
        </button>
      </div>

      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        {currentScene && (
          <p className="text-primary font-headline text-sm mb-2">{currentScene.year} · {currentScene.title}</p>
        )}
        <h2 className="text-3xl md:text-4xl font-headline italic tracking-tighter text-on-surface">场景专属考核</h2>
        <p className="text-tertiary font-label text-sm mt-1">紧扣场景事件与高考考点</p>
      </motion.div>

      {/* 进度 */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-label text-tertiary uppercase tracking-widest">
            第 {currentIndex + 1} 题 / 共 {questions.length} 题
          </span>
          <span className="text-xs font-label text-tertiary uppercase tracking-widest">
            正确: {answers.filter(a => a.isCorrect).length}
          </span>
        </div>
        <div className="h-1 bg-surface-container-highest overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl bg-surface-container-highest border border-white/5 shadow-xl"
        >
          <div className="p-6 md:p-8">
            {/* 题型标签 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-label uppercase tracking-widest">
                第 {currentIndex + 1} 题
              </span>
              <span className="px-2 py-1 bg-surface-container text-tertiary text-xs font-label">
                {isMultipleChoice(currentQuestion) ? '多选' : '单选'}
              </span>
              {currentQuestion.level && (
                <span className={`px-2 py-1 text-xs font-label ${
                  currentQuestion.level === 'basic' ? 'bg-green-500/10 text-green-400' :
                  currentQuestion.level === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {currentQuestion.level === 'basic' ? '基础' : currentQuestion.level === 'medium' ? '中档' : '高档'}
                </span>
              )}
            </div>

            {/* 题目 */}
            <h3 className="text-lg md:text-xl font-headline leading-relaxed text-on-surface mb-6">
              {currentQuestion.title}
            </h3>

            {/* 选项 */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <Option
                  key={opt.id}
                  letter={opt.id}
                  text={opt.text}
                  isSelected={selectedOptions.includes(opt.id)}
                  isCorrect={opt.isCorrect}
                  showResult={showReport}
                  isMultiple={isMultipleChoice(currentQuestion)}
                  onClick={() => handleToggleOption(opt.id)}
                />
              ))}
            </div>

            {/* 解析 - 只在答错时显示 */}
            <AnimatePresence>
              {showReport && !isCurrentCorrect && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-white/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-red-400" />
                    <span className="font-label text-xs font-bold uppercase tracking-widest text-red-400">试题解析</span>
                    <span className="text-xs text-tertiary font-label">（答错时显示）</span>
                  </div>
                  <p className="text-on-surface-variant font-body leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 答对提示 */}
            <AnimatePresence>
              {showReport && isCurrentCorrect && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-white/5 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="font-label uppercase tracking-widest">回答正确！</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* 操作按钮 */}
      <div className="w-full max-w-4xl mt-6 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 font-label uppercase tracking-widest text-sm transition-colors ${
            currentIndex === 0 ? 'text-tertiary/30 cursor-not-allowed' : 'text-tertiary hover:text-primary'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          上一题
        </button>

        {!showReport ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0}
            className={`px-8 py-3 font-headline italic text-lg tracking-widest transition-all ${
              selectedOptions.length > 0
                ? 'bg-primary text-on-primary hover:bg-primary/90'
                : 'bg-surface-container text-tertiary/30 cursor-not-allowed'
            }`}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary font-headline italic text-lg tracking-widest hover:bg-primary/90 transition-colors"
          >
            {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div className="w-20"></div>
      </div>
    </div>
  );
};

export default AssessmentScreen;

// 选项组件
const Option: React.FC<{
  letter: string,
  text: string,
  isSelected: boolean,
  isCorrect: boolean,
  showResult: boolean,
  isMultiple: boolean,
  onClick: () => void
}> = ({ letter, text, isSelected, isCorrect, showResult, isMultiple, onClick }) => {
  const getStyle = () => {
    if (!showResult) {
      return isSelected
        ? 'bg-primary/10 border-primary/50 text-primary'
        : 'border-white/10 hover:border-white/30 hover:bg-white/5';
    }
    if (isCorrect) return 'bg-green-500/10 border-green-500/50 text-green-400';
    if (isSelected && !isCorrect) return 'bg-red-500/10 border-red-500/50 text-red-400';
    return 'border-white/5 opacity-50';
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${getStyle()}`}
    >
      <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border text-sm ${
        showResult && isCorrect ? 'border-green-500 bg-green-500/20 text-green-400' :
        showResult && isSelected && !isCorrect ? 'border-red-500 bg-red-500/20 text-red-400' :
        isSelected ? 'border-primary bg-primary/20 text-primary' : 'border-white/20 text-tertiary'
      }`}>
        {showResult && isCorrect && <Check className="w-4 h-4" />}
        {showResult && isSelected && !isCorrect && <X className="w-4 h-4" />}
        {(!showResult || (!isSelected && !isCorrect)) && (
          isMultiple ? (
            isSelected ? <div className="w-2.5 h-2.5 bg-primary rounded-sm" /> : <span>{letter}</span>
          ) : (
            isSelected ? <Check className="w-3 h-3" /> : <span>{letter}</span>
          )
        )}
      </div>
      <p className="text-base font-body leading-relaxed flex-1">{text}</p>
    </div>
  );
};
