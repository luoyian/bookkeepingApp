import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Language, Transaction } from '../types';
import { t } from '../i18n';
import { DatePickerModal } from '../components/DatePickerModal';

interface ListProps {
  language: Language;
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
}

export const List: React.FC<ListProps> = ({ language, transactions, onEditTransaction }) => {
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const months = Array.from({ length: 12 }, (_, i) => ({
    label: (i + 1).toString().padStart(2, '0'),
    value: i
  }));

  const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);

  useEffect(() => {
    if (scrollRef.current && viewType === 'month') {
      const activeBtn = scrollRef.current.querySelector(`[data-month="${selectedMonth}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedMonth, viewType]);

  const handlePrev = () => {
    if (viewType === 'month') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    } else {
      setSelectedYear(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewType === 'month') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    } else {
      setSelectedYear(prev => prev + 1);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.time);
    if (viewType === 'month') {
      return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
    } else {
      return txDate.getFullYear() === selectedYear;
    }
  });

  const totalIncome = filteredTransactions.filter(tx => tx.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(tx => tx.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto pb-32"
    >
      <header className="sticky top-0 z-30 ios-blur border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button className="w-10 h-10 flex items-center justify-start text-primary">
            <span className="material-symbols-outlined !text-[28px]">chevron_left</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{t('list', language)}</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-end text-primary font-medium">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold">
                {selectedYear}{language === 'zh' ? '年' : '-'}
                {viewType === 'month' && `${selectedMonth + 1}${language === 'zh' ? '月' : ''}`}
              </p>
              <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </div>
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setViewType('month')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewType === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
            >
              {t('month', language)}
            </button>
            <button 
              onClick={() => setViewType('year')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewType === 'year' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
            >
              {t('year', language)}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
          <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar py-1 flex-1 px-2">
            {viewType === 'month' ? months.map(m => (
              <button 
                key={m.value}
                data-month={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`text-xs font-bold transition-all whitespace-nowrap px-2 py-1 rounded-lg ${selectedMonth === m.value ? 'text-primary bg-primary/5' : 'text-slate-400'}`}
              >
                {m.label}{language === 'zh' ? '月' : ''}
              </button>
            )) : years.map(y => (
              <button 
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`text-xs font-bold transition-all whitespace-nowrap px-2 py-1 rounded-lg ${selectedYear === y ? 'text-primary bg-primary/5' : 'text-slate-400'}`}
              >
                {y}{language === 'zh' ? '年' : ''}
              </button>
            ))}
          </div>
          <button onClick={handleNext} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </button>
        </div>
      </div>

      <DatePickerModal 
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
        language={language}
        onSelect={(y, m) => {
          setSelectedYear(y);
          setSelectedMonth(m);
        }}
      />

      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t('expense', language)}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">¥{totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t('income', language)}</p>
            <p className="text-xl font-bold text-emerald-500">¥{totalIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-8 space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => (
            <div 
              key={tx.id} 
              onClick={() => onEditTransaction(tx)}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div 
                className="size-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tx.categoryColor}20`, color: tx.categoryColor }}
              >
                <span className="material-symbols-outlined">{tx.categoryIcon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{tx.category}</span>
                  <span className={`text-sm font-bold ${tx.type === 'expense' ? 'text-slate-900 dark:text-white' : 'text-emerald-500'}`}>
                    {tx.type === 'expense' ? '-' : '+'}¥{tx.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{tx.time} • {tx.account}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined !text-6xl text-slate-100 dark:text-slate-800 mb-4">history</span>
            <p className="text-slate-400 font-medium">No transactions found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
