import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Account, Language } from '../types';
import { t } from '../i18n';

interface AddAccountModalProps {
  language: Language;
  onSave: (account: Account) => void;
  onDelete?: () => void;
  onClose: () => void;
  initialData?: Account;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ language, onSave, onDelete, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [balance, setBalance] = useState(initialData?.balance.toString() || '');
  const [icon, setIcon] = useState(initialData?.icon || 'account_balance_wallet');
  const [color, setColor] = useState(initialData?.color || '#137fec');

  const icons = ['payments', 'credit_card', 'account_balance_wallet', 'chat_bubble', 'savings', 'account_balance', 'wallet', 'currency_exchange'];
  const colors = [
    '#137fec', // Blue
    '#10b981', // Emerald
    '#0ea5e9', // Sky
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#a855f7', // Purple
    '#64748b', // Slate
    '#f97316', // Orange
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];

  const handleSave = () => {
    if (!name) return;
    const account: Account = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name,
      nameEn: name,
      type: initialData?.type || 'Custom',
      balance: parseFloat(balance) || 0,
      icon,
      color,
      description: description || (language === 'zh' ? '自定义账户' : 'Custom Account'),
      status: initialData?.status || 'Active'
    };
    onSave(account);
    onClose();
  };

  const handleCustomIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert('Custom icon upload functionality would go here.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">{initialData ? t('editAccount', language) : t('addAccount', language)}</h2>
          <button onClick={onClose} className="text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'zh' ? '账户名称' : 'Account Name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder={language === 'zh' ? '例如: 招商银行, 支付宝' : 'e.g. CMB Bank'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'zh' ? '账户类型' : 'Account Type'}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder={language === 'zh' ? '例如: 储蓄卡, 零钱' : 'e.g. Debit Card'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('amount', language)}</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">图标 Icon</label>
              <label className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                自定义上传
                <input type="file" className="hidden" onChange={handleCustomIcon} accept="image/*" />
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {icons.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`size-10 rounded-lg flex items-center justify-center transition-all ${icon === i ? 'bg-primary text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{i}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">颜色 Color</label>
              <div className="relative">
                <input
                  type="color"
                  id="customColor"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  value={colors.includes(color) ? '#000000' : color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <label htmlFor="customColor" className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                  {language === 'zh' ? '自定义色盘' : 'Color Palette'}
                </label>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 rounded-lg transition-all border-2 ${color === c ? 'border-primary scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                </button>
              ))}
              {!colors.includes(color) && (
                <button
                  onClick={() => { }}
                  className="h-8 rounded-lg transition-all border-2 border-primary scale-110"
                  style={{ backgroundColor: color }}
                >
                </button>
              )}
            </div>
          </div>
        </div>

        {initialData && onDelete && (
          <div className="px-6 pb-2 pt-4">
            <button
              onClick={() => {
                if (window.confirm(language === 'zh' ? '确定要注销/删除此账户吗？' : 'Are you sure you want to delete this account?')) {
                  onDelete();
                  onClose();
                }
              }}
              className="w-full py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-500 font-bold rounded-xl border border-rose-100 dark:border-rose-900/30 active:bg-rose-100 transition-colors"
            >
              {language === 'zh' ? '删除此账户' : 'Delete Account'}
            </button>
          </div>
        )}

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {t('cancel', language)}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-primary shadow-lg shadow-primary/20"
          >
            {t('save', language)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
