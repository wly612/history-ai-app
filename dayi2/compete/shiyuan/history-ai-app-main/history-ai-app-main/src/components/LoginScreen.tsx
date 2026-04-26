import React, { useState } from 'react';
import { motion } from 'motion/react';
import { loginUser } from '../services/apiClient';

interface LoginScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      const adminPattern = /^admin([1-9]|10)$/i;
      const isAdmin = adminPattern.test(email.trim()) && email.trim().toLowerCase() === password.trim().toLowerCase();
      localStorage.setItem('history-ai-admin', isAdmin ? 'true' : 'false');
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError('登录失败，请检查账号和口令后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 relative overflow-hidden">
      <div className="fixed inset-0 vignette z-0 pointer-events-none"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-container border border-white/10 p-8 relative z-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-headline italic tracking-tighter text-primary mb-2">时空档案局</h1>
          <p className="text-tertiary font-label uppercase tracking-widest text-xs">登录系统</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-800 text-red-200 text-sm font-body">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary mb-2">档案邮箱</label>
            <input 
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-highest border border-white/5 p-3 text-on-surface focus:border-primary outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary mb-2">访问口令</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-highest border border-white/5 p-3 text-on-surface focus:border-primary outline-none transition-colors"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary text-on-primary font-headline italic text-lg tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isLoading ? '核验中...' : '启动链路'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onSwitchToRegister}
            className="text-tertiary hover:text-primary transition-colors font-label uppercase tracking-widest text-xs"
          >
            新员入职登记
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
