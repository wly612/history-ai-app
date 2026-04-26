import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, ArrowLeft, User, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen pt-32 pb-32 px-6 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-on-surface mb-4">时代人物对话</h1>
          <p className="text-tertiary font-headline italic text-xl opacity-60">跨越时空，与历史的见证者面对面。</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {NPCS.map((npc, index) => (
            <motion.div
              key={npc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectNpc(npc)}
              className="bg-surface-container-highest border border-white/5 group cursor-pointer overflow-hidden relative h-80 flex flex-col"
            >
              <img 
                src={npc.avatar} 
                alt={npc.name}
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
              <div className="relative mt-auto p-6">
                <div className="text-primary font-headline italic text-2xl mb-1">{npc.name}</div>
                <div className="text-xs text-tertiary font-label uppercase tracking-widest mb-3">{npc.title}</div>
                <p className="text-on-surface-variant text-sm font-body italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {npc.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col bg-surface overflow-hidden">
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
              <img src={selectedNpc.avatar} alt={selectedNpc.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="text-xl font-headline italic text-primary">{selectedNpc.name}</div>
              <div className="text-[10px] text-tertiary font-label uppercase tracking-widest">{selectedNpc.title}</div>
            </div>
          </div>
        </div>
        <div className="hidden md:block text-[10px] text-tertiary/40 font-label uppercase tracking-[0.3em]">
          正在建立时空链路...
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
  );
};

export default DialogueScreen;
