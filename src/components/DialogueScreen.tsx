import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, ArrowLeft, User, Loader2, MapPin, Calendar, Quote, Award, BookOpen, ChevronRight, Info, X } from 'lucide-react';
import { NPCS, NPC } from '../types';
import { chatWithNpc, submitLog } from '../services/apiClient';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface DialogueScreenProps {
  sceneId?: string;
  onNpcInteract: (npcName: string) => void;
  onNpcSelect: (active: boolean) => void;
}

const DialogueScreen: React.FC<DialogueScreenProps> = ({ sceneId, onNpcInteract, onNpcSelect }) => {
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectNpc = (npc: NPC) => {
    setSelectedNpc(npc);
    onNpcSelect(true);
    onNpcInteract(npc.name);
    setMessages([
      { role: 'model', content: `你好，我是${npc.name}。在这段波澜壮阔的历史中，你有什么想问我的吗？` }
    ]);
  };

  const handleBack = () => {
    setSelectedNpc(null);
    onNpcSelect(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedNpc || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (sceneId) {
        await submitLog(sceneId, `User said to ${selectedNpc.name}: ${userMessage}`);
      }

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await chatWithNpc(selectedNpc.id, sceneId || '1937', history, userMessage);
      
      if (sceneId) {
        await submitLog(sceneId, `${selectedNpc.name} replied: ${response}`);
      }
      
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "信号干扰，无法获取回应" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedNpc) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-on-surface mb-4">时代人物对话</h1>
          <p className="text-tertiary font-headline italic text-xl opacity-60">跨越时空，与历史的见证者面对面。</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {NPCS.map((npc, index) => (
            <motion.div
              key={npc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectNpc(npc)}
              className="bg-surface-container-highest border border-white/5 group cursor-pointer overflow-hidden relative flex flex-row"
            >
              {/* 左侧头像 */}
              <div className="w-40 h-48 flex-shrink-0 relative overflow-hidden">
                <img
                  src={npc.avatar}
                  alt={npc.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x192/1a1a1a/666666?text=' + npc.name;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container-highest"></div>
              </div>

              {/* 右侧信息 */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  {/* 姓名、职衔 */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-primary font-headline italic text-2xl">{npc.name}</div>
                      <div className="text-xs text-tertiary font-label uppercase tracking-widest">{npc.title}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-tertiary/60 font-label">
                      <Calendar className="w-3 h-3" />
                      <span>{npc.lifespan}</span>
                    </div>
                  </div>

                  {/* 出生地 */}
                  <div className="flex items-center gap-1 text-xs text-tertiary/60 font-label mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{npc.birthPlace}</span>
                  </div>

                  {/* 简介 */}
                  <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-3 line-clamp-2">
                    {npc.description}
                  </p>

                  {/* 名言 */}
                  <div className="flex items-start gap-2 mb-3">
                    <Quote className="w-4 h-4 text-primary/40 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-on-surface-variant/70 font-body italic line-clamp-2">
                      "{npc.famousQuote}"
                    </p>
                  </div>
                </div>

                {/* 主要成就标签 */}
                <div className="flex flex-wrap gap-2">
                  {npc.achievements.slice(0, 2).map((achievement, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-primary/10 text-primary/80 font-label uppercase tracking-wider">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover 提示 */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex bg-surface overflow-hidden">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div className="relative z-10 px-8 py-6 bg-surface-container border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-tertiary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container-highest overflow-hidden border border-primary/20">
                <img src={selectedNpc.avatar} alt={selectedNpc.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48/1a1a1a/666666?text=' + selectedNpc.name; }} />
              </div>
              <div>
                <div className="text-xl font-headline italic text-primary">{selectedNpc.name}</div>
                <div className="text-[10px] text-tertiary font-label uppercase tracking-widest">{selectedNpc.title}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 transition-colors ${showInfo ? 'text-primary' : 'text-tertiary hover:text-primary'}`}
            >
              <Info className="w-6 h-6" />
            </button>
            <div className="hidden md:block text-[10px] text-tertiary/40 font-label uppercase tracking-[0.3em]">
              正在建立时空链路...
            </div>
          </div>
        </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative"
      >
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <img src={selectedNpc.avatar} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
        </div>
        
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
          >
            <div className={`max-w-[80%] md:max-w-[60%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 flex-shrink-0 bg-surface-container-highest flex items-center justify-center border border-white/5">
                {msg.role === 'user' ? <User className="w-5 h-5 text-tertiary" /> : <img src={selectedNpc.avatar} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />}
              </div>
              <div className={`p-4 ${msg.role === 'user' ? 'bg-primary/10 border-r-2 border-primary' : 'bg-surface-container-high border-l-2 border-primary-container'} shadow-xl`}>
                <p className="text-lg font-body leading-relaxed text-on-surface whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center border border-white/5">
                <img src={selectedNpc.avatar} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4 bg-surface-container-high border-l-2 border-primary-container flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-label italic text-tertiary">正在思考...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat Input */}
      <div className="relative z-10 p-8 bg-surface-container border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-end gap-4 border-b border-on-surface-variant/20 py-2 focus-within:border-primary transition-colors">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-transparent border-none text-xl font-body text-on-surface placeholder:text-tertiary/30 focus:ring-0 focus:outline-none py-2 resize-none max-h-32" 
              placeholder="跨越时空，输入你想说的话..."
            />
            <div className="flex items-center gap-2 pb-2">
              <button className="text-tertiary p-2 hover:text-primary transition-colors">
                <Mic className="w-6 h-6" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2 transition-all ${inputValue.trim() && !isLoading ? 'text-primary scale-110' : 'text-tertiary opacity-30'}`}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center font-label text-[10px] uppercase tracking-widest opacity-40">
            <span>当前链路：历史档案库 - 深度交互模式</span>
            <span>AI 智能辅助对话</span>
          </div>
        </div>
      </div>
      </div>

      {/* 人物信息侧边栏 */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-surface-container border-l border-white/5 overflow-hidden flex-shrink-0"
          >
            <div className="w-80 h-full overflow-y-auto custom-scrollbar">
              {/* 头像和基本信息 */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={selectedNpc.avatar}
                  alt={selectedNpc.name}
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x192/1a1a1a/666666?text=' + selectedNpc.name; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent"></div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="absolute top-3 right-3 p-1 bg-surface/80 text-tertiary hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-2xl font-headline italic text-primary">{selectedNpc.name}</div>
                  <div className="text-xs text-tertiary font-label uppercase tracking-widest">{selectedNpc.title}</div>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="p-4 space-y-4">
                {/* 生卒年和出生地 */}
                <div className="flex gap-4 text-xs font-label text-tertiary">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{selectedNpc.lifespan}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedNpc.birthPlace}</span>
                  </div>
                </div>

                {/* 简介 */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary/80 font-label uppercase tracking-widest">
                    <BookOpen className="w-3 h-3" />
                    <span>生平简介</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                    {selectedNpc.backstory}
                  </p>
                </div>

                {/* 主要成就 */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary/80 font-label uppercase tracking-widest">
                    <Award className="w-3 h-3" />
                    <span>主要成就</span>
                  </div>
                  <ul className="space-y-1">
                    {selectedNpc.achievements.map((achievement, i) => (
                      <li key={i} className="text-sm text-on-surface-variant font-body flex items-start gap-2">
                        <span className="text-primary/60 mt-1">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 名言 */}
                <div className="bg-primary/5 border-l-2 border-primary p-3">
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary/80 font-label uppercase tracking-widest">
                    <Quote className="w-3 h-3" />
                    <span>名言</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-body italic leading-relaxed">
                    "{selectedNpc.famousQuote}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DialogueScreen;
