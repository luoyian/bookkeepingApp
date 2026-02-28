import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { t } from '../i18n';
import { Github, Chrome, MessageCircle, User } from 'lucide-react';
import { apiLogin, apiRegister } from '../services/api';

interface LoginProps {
  language: Language;
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ language, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await apiRegister(email, password, email.split('@')[0]);
      } else {
        await apiLogin(email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || (language === 'zh' ? '操作失败，请重试' : 'Operation failed, please retry'));
    } finally {
      setLoading(false);
    }
  };

  const socialLogins = [
    { id: 'wechat', icon: <MessageCircle className="size-5 text-[#07C160]" />, label: '微信' },
    { id: 'qq', icon: <User className="size-5 text-[#12B7F5]" />, label: 'QQ' },
    { id: 'google', icon: <Chrome className="size-5 text-[#4285F4]" />, label: 'Google' },
    { id: 'github', icon: <Github className="size-5 text-slate-900 dark:text-white" />, label: 'GitHub' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto size-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-xl shadow-primary/5"
          >
            <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {mode === 'login' ? t('welcome', language) : t('register', language)}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'login' ? t('pleaseLogin', language) : (language === 'zh' ? '创建一个新账号以开始记账' : 'Create a new account to start')}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm px-4 py-3 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              {language === 'zh' ? '邮箱' : 'Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder={language === 'zh' ? '请输入邮箱' : 'Enter email'}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('password', language)}
              </label>
              {mode === 'login' && (
                <button type="button" className="text-[10px] font-bold text-primary hover:underline">
                  {language === 'zh' ? '忘记密码？' : 'Forgot?'}
                </button>
              )}
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder={language === 'zh' ? '请输入密码（至少6位）' : 'Enter password (min 6 chars)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {language === 'zh' ? '处理中...' : 'Processing...'}
              </span>
            ) : (
              mode === 'login' ? t('login', language) : t('register', language)
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
          >
            {mode === 'login' ? (
              <>{t('noAccount', language)} <span className="text-primary font-bold">{t('registerNow', language)}</span></>
            ) : (
              <>{t('hasAccount', language)} <span className="text-primary font-bold">{t('login', language)}</span></>
            )}
          </button>
        </div>

        <div className="space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background-light dark:bg-background-dark px-4 text-slate-400 font-medium">
                {t('orLoginWith', language)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {socialLogins.map((social) => (
              <button
                key={social.id}
                type="button"
                className="flex flex-col items-center gap-2 group"
                title={social.label}
              >
                <div className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-primary/30 group-hover:bg-primary/5 transition-all group-active:scale-90">
                  {social.icon}
                </div>
                <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  {social.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
