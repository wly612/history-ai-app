import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Theater, FileText, BarChart3, Shield, Settings, X, Camera, User as UserIcon } from 'lucide-react';
import { Screen, AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  hideNav?: boolean;
  appState?: AppState;
  onUpdateProfile?: (profile: { name: string; avatar: string; registrationId: number }) => void;
  onLogout?: () => void;
}

export default function Layout({ children, currentScreen, onScreenChange, hideNav, appState, onUpdateProfile, onLogout }: LayoutProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isChromeHidden, setIsChromeHidden] = useState(false);
  const [tempName, setTempName] = useState(appState?.userProfile.name || '');
  const [tempAvatar, setTempAvatar] = useState(appState?.userProfile.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsChromeHidden(window.scrollY > 120);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveProfile = () => {
    if (onUpdateProfile && appState) {
      onUpdateProfile({ 
        name: tempName, 
        avatar: tempAvatar, 
        registrationId: appState.userProfile.registrationId 
      });
    }
    setShowSettings(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body overflow-x-hidden">
      <div className="film-grain" />
      
      {/* Top Navigation */}
      {!hideNav && (
        <header className={`fixed top-0 w-full z-50 flex flex-wrap justify-between items-start gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 bg-transparent shadow-[0_0_64px_rgba(0,0,0,0.8)] backdrop-blur-sm md:backdrop-blur-none transition-all duration-500 ${
          isChromeHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}>
          <div className="flex flex-col leading-[0.95] lg:hidden">
            <span className="text-[1.7rem] sm:text-[1.95rem] font-bold text-primary-container drop-shadow-[0_2px_10px_rgba(139,0,0,0.4)] font-headline tracking-[0.04em]">
              历史档案馆
            </span>
            <span className="mt-2 text-[0.95rem] sm:text-[1.1rem] text-primary/85 font-headline tracking-[0.16em] pl-[0.08em]">
              档案 1937-1949
            </span>
            <div className="mt-3 text-[10px] uppercase tracking-[0.28em] text-tertiary/40 font-label">
              机密访问限制
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:gap-4 max-w-full">
            {appState && (
              <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 bg-surface-container-high border border-white/5 rounded-full max-w-[9.5rem] sm:max-w-[12rem] md:max-w-[14rem]">
                <img 
                  src={appState.userProfile.avatar} 
                  alt={appState.userProfile.name} 
                  className="w-8 h-8 rounded-full object-cover border border-primary/20"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-label italic text-tertiary truncate hidden sm:inline">{appState.userProfile.name}</span>
              </div>
            )}
            <button 
              onClick={() => {
                setTempName(appState?.userProfile.name || '');
                setTempAvatar(appState?.userProfile.avatar || '');
                setShowSettings(true);
              }}
              className="shrink-0 p-2 text-tertiary hover:text-primary transition-colors bg-surface-container-high border border-white/5 rounded-full"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </header>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isChromeHidden ? 0 : 1, y: isChromeHidden ? -24 : 0 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              if (isChromeHidden) setShowSettings(false);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            className="bg-surface-container-high max-w-md w-full p-6 sm:p-8 border border-white/5 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 text-tertiary hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-headline italic text-primary mb-8">个人档案设置</h2>

              <div className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors">
                      <img src={tempAvatar} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  <span className="text-xs font-label uppercase tracking-widest text-tertiary/60">点击上传头像</span>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase tracking-widest text-primary/60">馆员代号</label>
                  <div className="flex items-center gap-3 bg-surface-container-highest border-b border-primary/20 p-3 focus-within:border-primary transition-colors">
                    <UserIcon className="w-5 h-5 text-tertiary" />
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-transparent border-none text-xl font-body text-on-surface focus:ring-0 w-full"
                      placeholder="输入你的代号..."
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="flex-1 py-3 border border-white/10 text-tertiary font-headline italic tracking-widest hover:bg-white/5 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="flex-1 py-3 bg-primary text-on-primary font-headline italic tracking-widest hover:scale-105 transition-transform"
                    >
                      保存更改
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setShowSettings(false);
                      onLogout?.();
                    }}
                    className="w-full py-3 border border-primary/20 text-primary/85 font-headline italic tracking-widest hover:bg-primary/8 transition-colors"
                  >
                    断开链接（登出）
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Navigation (Desktop) */}
      {!hideNav && (
        <aside className="fixed left-0 top-0 h-full w-72 bg-[#131313]/90 backdrop-blur-xl flex flex-col py-12 z-40 hidden lg:flex shadow-[40px_0_80px_rgba(0,0,0,0.9)]">
          <div className="px-8 mb-16">
            <div className="flex flex-col leading-[0.95]">
              <div className="text-[1.6rem] font-black text-primary-container font-headline tracking-[0.04em]">历史档案馆</div>
              <div className="mt-2 text-sm text-primary/80 font-headline tracking-[0.16em]">档案 1937-1949</div>
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-tertiary/40 font-label">机密访问限制</div>
          </div>
          <div className="flex flex-col gap-4">
            <NavItem 
              icon={<Map className="w-5 h-5" />} 
              label="历史编年" 
              active={currentScreen === 'chronicle'} 
              onClick={() => onScreenChange('chronicle')} 
            />
            <NavItem 
              icon={<Theater className="w-5 h-5" />} 
              label="时代人物对话" 
              active={currentScreen === 'dialogue'} 
              onClick={() => onScreenChange('dialogue')} 
            />
            <NavItem 
              icon={<FileText className="w-5 h-5" />} 
              label="文献评估" 
              active={currentScreen === 'assessment'} 
              onClick={() => onScreenChange('assessment')} 
            />
            <NavItem 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="战略情报" 
              active={currentScreen === 'report'} 
              onClick={() => onScreenChange('report')} 
            />
          </div>
          <div className="mt-auto px-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-container-highest border border-outline/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-container" />
            </div>
            <div className="text-[10px] uppercase tracking-widest text-tertiary/60 font-label">馆员节点</div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`relative min-h-screen overflow-x-hidden ${!hideNav ? 'lg:pl-72' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      {!hideNav && (
        <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-6 sm:px-10 pb-6 sm:pb-8 h-22 sm:h-24 bg-gradient-to-t from-[#131313] via-[#131313]/80 to-transparent">
          <MobileNavItem 
            icon={<Map className="w-6 h-6" />} 
            label="地图" 
            active={currentScreen === 'chronicle'} 
            onClick={() => onScreenChange('chronicle')} 
          />
          <MobileNavItem 
            icon={<Theater className="w-6 h-6" />} 
            label="对话" 
            active={currentScreen === 'dialogue'} 
            onClick={() => onScreenChange('dialogue')} 
          />
          <MobileNavItem 
            icon={<FileText className="w-6 h-6" />} 
            label="考察" 
            active={currentScreen === 'assessment'} 
            onClick={() => onScreenChange('assessment')} 
          />
          <MobileNavItem 
            icon={<BarChart3 className="w-6 h-6" />} 
            label="报告" 
            active={currentScreen === 'report'} 
            onClick={() => onScreenChange('report')} 
          />
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 pl-8 py-3 font-headline italic tracking-wide transition-all duration-300 w-full text-left ${
        active 
          ? 'text-primary border-l-4 border-primary-container bg-gradient-to-r from-primary-container/20 to-transparent' 
          : 'text-tertiary/50 hover:bg-[#131313] hover:text-on-surface'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all ${
        active 
          ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(255,180,168,0.5)]' 
          : 'text-tertiary opacity-40 hover:opacity-100'
      }`}
    >
      {icon}
      <span className="font-label text-[10px] uppercase tracking-[0.2em] mt-1">{label}</span>
    </button>
  );
}
