import React from 'react';
import { motion } from 'motion/react';
import { UserProfile, Language } from '../types';
import { t } from '../i18n';

interface ProfileProps {
  user: UserProfile;
  language: Language;
  onEditProfile: () => void;
  onLogout: () => void;
  onToggleLanguage: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, language, onEditProfile, onLogout, onToggleLanguage }) => {
  const services = [
    { icon: 'category', label: t('categories', language), color: 'blue' },
    { icon: 'export_notes', label: t('dataExport', language), color: 'amber' },
    { icon: 'lock', label: t('security', language), color: 'emerald' },
    { 
      icon: 'language', 
      label: t('language', language), 
      color: 'purple', 
      extra: language === 'zh' ? '中文' : 'English',
      onClick: onToggleLanguage
    },
  ];

  const support = [
    { icon: 'help', label: t('support', language), color: 'slate' },
    { icon: 'favorite', label: t('rateUs', language), color: 'pink' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto pb-32"
    >
      <header className="sticky top-0 z-30 ios-blur border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
              <img alt="Avatar" src={user.avatar} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{user.name}</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{user.membership}</p>
            </div>
          </div>
          <button 
            onClick={onEditProfile}
            className="w-10 h-10 flex items-center justify-end text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined !text-[24px]">settings</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 px-4 mt-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-1">{t('days', language)}</p>
          <p className="text-lg font-bold">128</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-1">{t('notes', language)}</p>
          <p className="text-lg font-bold">1,432</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-1">{t('streak', language)}</p>
          <p className="text-lg font-bold">15</p>
        </div>
      </div>

      <div className="mt-8 px-4 space-y-4">
        <h2 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('myServices', language)}</h2>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {services.map((s, idx) => (
            <button 
              key={idx} 
              onClick={s.onClick}
              className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${idx !== services.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-xl bg-${s.color}-50 dark:bg-${s.color}-900/20 flex items-center justify-center text-${s.color}-500`}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{s.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.extra && <span className="text-xs text-slate-400">{s.extra}</span>}
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {support.map((s, idx) => (
            <button key={idx} className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${idx !== support.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-xl bg-${s.color}-50 dark:bg-${s.color}-900/20 flex items-center justify-center text-${s.color}-500`}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{s.label}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          ))}
        </div>

        <div className="pt-6">
          <button 
            onClick={onLogout}
            className="w-full bg-rose-50 dark:bg-rose-900/10 py-4 rounded-2xl text-rose-600 dark:text-rose-500 font-bold shadow-sm border border-rose-100 dark:border-rose-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="tracking-wide">{t('logout', language)}</span>
          </button>
        </div>
      </div>

      <div className="mt-8 px-8 text-center">
        <p className="text-[10px] text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] font-medium">App Version 2.4.0 (Build 108)</p>
      </div>
    </motion.div>
  );
};

