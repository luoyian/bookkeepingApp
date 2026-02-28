import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { t } from '../i18n';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
  initialYear: number;
  initialMonth: number;
  language: Language;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialYear,
  initialMonth,
  language
}) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const years = Array.from({ length: 20 }, (_, i) => initialYear - 10 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 space-y-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{t('selectDate', language)}</h3>
              <button onClick={onClose} className="text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('year', language)}</p>
                <div className="h-48 overflow-y-auto no-scrollbar space-y-1 pr-1">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${year === y ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      {y}{language === 'zh' ? '年' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('month', language)}</p>
                <div className="h-48 overflow-y-auto no-scrollbar space-y-1 pr-1">
                  {months.map(m => (
                    <button
                      key={m}
                      onClick={() => setMonth(m)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${month === m ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      {m + 1}{language === 'zh' ? '月' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelect(year, month);
                onClose();
              }}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
              {t('confirm', language)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
