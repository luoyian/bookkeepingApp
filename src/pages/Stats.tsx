import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Language, Transaction } from '../types';
import { t } from '../i18n';
import { DatePickerModal } from '../components/DatePickerModal';
import { DonutChart } from '../components/DonutChart';
import * as d3 from 'd3';

interface StatsProps {
  language: Language;
  transactions: Transaction[];
}

export const Stats: React.FC<StatsProps> = ({ language, transactions }) => {
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statType, setStatType] = useState<'expense' | 'income'>('expense');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
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
    const matchesPeriod = viewType === 'month' 
      ? (txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear)
      : (txDate.getFullYear() === selectedYear);
    return matchesPeriod && tx.type === statType;
  });

  const totalAmount = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Group by category
  const categoryGroups: Record<string, { label: string, amount: number, color: string }> = filteredTransactions.reduce((acc, tx) => {
    if (!acc[tx.category]) {
      acc[tx.category] = { label: tx.category, amount: 0, color: tx.categoryColor };
    }
    acc[tx.category].amount += tx.amount;
    return acc;
  }, {} as Record<string, { label: string, amount: number, color: string }>);

  const breakdown = Object.values(categoryGroups)
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({
      ...item,
      percent: totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0,
      isHidden: hiddenCategories.includes(item.label)
    }));

  const visibleBreakdown = breakdown.filter(item => !item.isHidden);
  const visibleTotal = visibleBreakdown.reduce((acc, curr) => acc + curr.amount, 0);

  const toggleCategory = (label: string) => {
    setHiddenCategories(prev => 
      prev.includes(label) 
        ? prev.filter(c => c !== label) 
        : [...prev, label]
    );
  };

  // Trend data (last 6 months)
  const trendData = months.map(m => {
    const monthAmount = transactions
      .filter(tx => {
        const txDate = new Date(tx.time);
        return txDate.getMonth() === m.value && txDate.getFullYear() === selectedYear && tx.type === statType;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { label: m.label, amount: monthAmount };
  });

  const maxTrendAmount = Math.max(...trendData.map(d => d.amount), 1);

  // Dynamic percentage calculation
  const getPercentageChange = () => {
    const currentMonthAmount = trendData[selectedMonth].amount;
    const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    
    const prevMonthAmount = transactions
      .filter(tx => {
        const txDate = new Date(tx.time);
        return txDate.getMonth() === prevMonthIndex && txDate.getFullYear() === prevMonthYear && tx.type === statType;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (prevMonthAmount === 0) return currentMonthAmount > 0 ? 100 : 0;
    return ((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100;
  };

  const percentChange = getPercentageChange();

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
            <h1 className="text-lg font-bold">{t('stats', language)}</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-end text-primary font-medium">
            <span className="material-symbols-outlined">share</span>
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
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
          <button 
            onClick={() => setStatType('expense')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${statType === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            {t('expense', language)}
          </button>
          <button 
            onClick={() => setStatType('income')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${statType === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            {t('income', language)}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 mx-4 mt-6 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-bold">{t('spendingBreakdown', language)}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">¥{totalAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative size-56 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <DonutChart 
                data={visibleBreakdown} 
                width={224} 
                height={224} 
                onSegmentClick={(label) => toggleCategory(label)}
              />
            </div>
            <div className="z-10 size-36 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-slate-300 mb-1">payments</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('avgDay', language)}</span>
              <span className="text-lg font-bold">¥{(visibleTotal / 30).toFixed(1)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-10 max-h-48 overflow-y-auto no-scrollbar py-2">
            {breakdown.length > 0 ? breakdown.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => toggleCategory(item.label)}
                className={`flex items-center gap-3 group cursor-pointer transition-opacity ${item.isHidden ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-bold truncate ${item.isHidden ? 'line-through' : ''}`}>{item.label}</span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {visibleTotal > 0 && !item.isHidden ? Math.round((item.amount / visibleTotal) * 100) : 0}% • ¥{item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-4 text-slate-400 text-xs">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 mx-4 mt-4 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold">{t('trend', language)}</h3>
          </div>
          <div className={`flex items-center ${percentChange >= 0 ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'} px-2 py-1 rounded-lg`}>
            <span className="material-symbols-outlined !text-sm mr-1">{percentChange >= 0 ? 'trending_up' : 'trending_down'}</span>
            <span className="text-[10px] font-bold">{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-end gap-4 h-36 pt-4 min-w-max px-2">
            {trendData.map((d, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedMonth(months[idx].value)}
                className="flex flex-col items-center w-10 cursor-pointer group"
              >
                <div className={`relative w-8 rounded-t-lg h-24 overflow-hidden transition-all ${selectedMonth === months[idx].value ? 'bg-primary/20 border border-primary/20 scale-110' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                  <div 
                    className={`absolute bottom-0 w-full transition-all ${selectedMonth === months[idx].value ? 'bg-primary shadow-[0_-4px_10px_rgba(19,127,236,0.3)]' : 'bg-slate-300 dark:bg-slate-600'}`}
                    style={{ height: `${(d.amount / maxTrendAmount) * 100}%` }}
                  ></div>
                </div>
                <p className={`mt-3 text-[10px] font-bold transition-colors ${selectedMonth === months[idx].value ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {d.label}{language === 'zh' ? '月' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
