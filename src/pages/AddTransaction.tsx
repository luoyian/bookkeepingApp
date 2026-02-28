import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { Language, Account, Transaction } from '../types';
import { t } from '../i18n';

interface AddTransactionProps {
  onClose: () => void;
  language: Language;
  accounts: Account[];
  onAdd: (tx: any) => void;
  initialData?: Transaction;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({ onClose, language, accounts, onAdd, initialData }) => {
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '0.00');
  const [type, setType] = useState<'expense' | 'income'>(initialData ? initialData.type : 'expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    if (initialData) {
      const cat = CATEGORIES.find(c => c.name === initialData.category || c.nameEn === initialData.category);
      return cat ? cat.id : 'more';
    }
    return CATEGORIES[0].id;
  });
  const [date, setDate] = useState(initialData ? initialData.time : new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState(() => {
    if (initialData) {
      return accounts.find(a => a.name === initialData.account || a.nameEn === initialData.account) || accounts[0];
    }
    return accounts[0];
  });
  const [note, setNote] = useState(initialData ? initialData.note || '' : '');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState(initialData && !CATEGORIES.some(c => c.name === initialData.category || c.nameEn === initialData.category) ? initialData.category : '');
  const [customCategoryIcon, setCustomCategoryIcon] = useState<string | null>(initialData ? initialData.categoryIcon : null);

  const handleKeyClick = (key: string) => {
    if (key === 'backspace') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === 'OK' || key === 'done') {
      handleSave();
    } else {
      setAmount(prev => prev === '0' || prev === '0.00' ? key : prev + key);
    }
  };

  const handleSave = () => {
    let categoryName = '';
    let categoryIcon = '';
    let categoryColor = '';

    if (selectedCategoryId === 'more' && customCategoryName) {
      categoryName = customCategoryName;
      categoryIcon = 'stars'; // Default icon for custom
      categoryColor = '#8E8E93';
    } else {
      const category = CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];
      categoryName = language === 'zh' ? category.name : category.nameEn;
      categoryIcon = category.icon;
      categoryColor = category.color;
    }

    onAdd({
      ...(initialData ? { id: initialData.id } : {}),
      type,
      amount: parseFloat(amount),
      category: categoryName,
      categoryIcon,
      categoryColor,
      account: language === 'zh' ? selectedAccount.name : selectedAccount.nameEn,
      time: date,
      note
    });
  };

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomCategoryIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col max-w-[430px] mx-auto"
    >
      <header className="flex items-center bg-white dark:bg-slate-900 px-4 py-3 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <button onClick={onClose} className="text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-[17px] font-bold">{initialData ? (language === 'zh' ? '编辑账单' : 'Edit Transaction') : t('addTransaction', language)}</h1>
        </div>
        <button onClick={handleSave} className="text-primary font-bold text-[17px]">{t('save', language)}</button>
      </header>

      <main className="flex-1 overflow-y-auto pb-[320px]">
        <div className="px-4 py-4">
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {t('expense', language)}
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all ${type === 'income' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {t('income', language)}
            </button>
          </div>
        </div>

        <div className="px-6 py-6 text-right">
          <div className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-1">{t('amount', language)}</div>
          <div className="text-5xl font-bold tracking-tight flex items-baseline justify-end gap-2">
            <span className="text-2xl font-medium opacity-50">¥</span>
            <span>{amount}</span>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="grid grid-cols-4 gap-y-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => cat.id === 'more' ? setShowCustomCategory(true) : setSelectedCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1.5 transition-opacity ${selectedCategoryId === cat.id ? 'opacity-100' : 'opacity-60'}`}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform ${selectedCategoryId === cat.id ? 'scale-110 shadow-lg' : ''}`}
                  style={{ backgroundColor: selectedCategoryId === cat.id ? cat.color : '#e2e8f0' }}
                >
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold">{language === 'zh' ? cat.name : cat.nameEn}</div>
                </div>
              </div>
            ))}
            {selectedCategoryId === 'more' && customCategoryName && (
              <div className="flex flex-col items-center gap-1.5 opacity-100">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white scale-110 shadow-lg overflow-hidden bg-slate-400"
                >
                  {customCategoryIcon ? (
                    <img src={customCategoryIcon} className="w-full h-full object-cover" alt="custom" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl">stars</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold">{customCategoryName}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-4 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-slate-400 text-[20px] w-8">calendar_today</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold">{t('date', language)}</div>
            </div>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-[14px] font-medium p-0 focus:ring-0 text-right"
            />
          </div>
          <div 
            onClick={() => setShowAccountPicker(true)}
            className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800"
          >
            <span className="material-symbols-outlined text-slate-400 text-[20px] w-8">account_balance_wallet</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold">{t('account', language)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium">{language === 'zh' ? selectedAccount.name : selectedAccount.nameEn}</span>
              <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
            </div>
          </div>
          <div className="flex items-center px-4 py-3">
            <span className="material-symbols-outlined text-slate-400 text-[20px] w-8">notes</span>
            <div className="flex-1">
              <input 
                className="w-full bg-transparent border-none p-0 text-[14px] focus:ring-0 placeholder-slate-400" 
                placeholder={t('addNote', language)} 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-4 gap-[1px] bg-slate-200 dark:bg-slate-800">
          {['1', '2', '3', 'backspace', '4', '5', '6', '+', '7', '8', '9', '-', '.', '0', 'OK', 'done'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={`h-14 flex items-center justify-center text-xl font-medium transition-colors ${
                key === 'done' ? 'bg-primary text-white' : 
                ['backspace', '+', '-', 'OK'].includes(key) ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 
                'bg-white dark:bg-slate-700 text-slate-900 dark:text-white active:bg-slate-50 dark:active:bg-slate-600'
              }`}
            >
              {key === 'backspace' ? <span className="material-symbols-outlined">backspace</span> : 
               key === 'done' ? <span className="material-symbols-outlined font-bold">done</span> : 
               key}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAccountPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowAccountPicker(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-[32px] p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{t('selectAccount', language)}</h3>
                <button onClick={() => setShowAccountPicker(false)} className="text-slate-400">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                {accounts.map(acc => (
                  <button 
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccount(acc);
                      setShowAccountPicker(false);
                    }}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${selectedAccount.id === acc.id ? 'bg-primary/10 border-2 border-primary' : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent'}`}
                  >
                    <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${acc.color}20`, color: acc.color }}>
                      <span className="material-symbols-outlined">{acc.icon}</span>
                    </div>
                    <span className="font-bold">{language === 'zh' ? acc.name : acc.nameEn}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCustomCategory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowCustomCategory(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 space-y-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{language === 'zh' ? '自定义分类' : 'Custom Category'}</h3>
                <button onClick={() => setShowCustomCategory(false)} className="text-slate-400">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <label className="relative size-24 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                    {customCategoryIcon ? (
                      <img src={customCategoryIcon} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{language === 'zh' ? '上传图片' : 'Upload'}</span>
                      </div>
                    )}
                    <input type="file" className="hidden" onChange={handleCustomIconUpload} accept="image/*" />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'zh' ? '分类名称 (最多两个字)' : 'Category Name'}</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder={language === 'zh' ? '例如: 手办' : 'e.g. Toy'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (customCategoryName) {
                    setSelectedCategoryId('more');
                    setShowCustomCategory(false);
                  }
                }}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                {t('confirm', language)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
