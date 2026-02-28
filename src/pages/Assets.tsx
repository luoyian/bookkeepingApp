import React from 'react';
import { motion } from 'motion/react';
import { Account, Language } from '../types';
import { t } from '../i18n';

interface AssetsProps {
  accounts: Account[];
  language: Language;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  isAmountVisible: boolean;
  onToggleVisibility: () => void;
}

export const Assets: React.FC<AssetsProps> = ({
  accounts,
  language,
  onAddAccount,
  onEditAccount,
  isAmountVisible,
  onToggleVisibility
}) => {
  const totalAssets = accounts
    .filter(acc => acc.balance > 0)
    .reduce((acc, curr) => acc + curr.balance, 0);

  const totalLiabilities = accounts
    .filter(acc => acc.balance < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.balance), 0);

  const formatAmount = (amount: number) => {
    if (!isAmountVisible) return '****';
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto pb-32 pt-2"
    >
      <section className="px-4 py-4">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/60 text-xs font-medium tracking-wide">{t('netWorth', language)}</span>
              <button onClick={onToggleVisibility} className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">
                  {isAmountVisible ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">{formatAmount(totalAssets - totalLiabilities)}</h2>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{t('totalAssets', language)}</p>
                <p className="text-lg font-semibold tracking-tight">{formatAmount(totalAssets)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{t('totalLiabilities', language)}</p>
                <p className="text-lg font-semibold tracking-tight">{formatAmount(totalLiabilities)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <h3 className="text-lg font-bold leading-none mb-1">{t('myAccounts', language)}</h3>
          </div>
          <button className="text-primary text-sm font-semibold">{t('report', language)}</button>
        </div>
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => onEditAccount(acc)}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0 size-11"
                style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
              >
                <span className="material-symbols-outlined filled-icon">{acc.icon}</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold">{language === 'zh' ? acc.name : acc.nameEn}</span>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-[11px]">{acc.description}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold tracking-tight">{formatAmount(acc.balance)}</p>
                {acc.lastChange !== undefined ? (
                  <p className={`text-[10px] font-bold ${acc.lastChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {acc.lastChange >= 0 ? '+' : ''}¥{acc.lastChange.toLocaleString()}
                  </p>
                ) : acc.trend ? (
                  <p className="text-emerald-500 text-[10px] font-bold">+¥{acc.trend.toFixed(2)}</p>
                ) : null}
              </div>
            </div>
          ))}

          <button
            onClick={onAddAccount}
            className="w-full mt-6 py-4 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 active:scale-95 transition-transform bg-transparent"
          >
            <span className="material-symbols-outlined text-[28px]">add_circle</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold">{t('addAccount', language)}</span>
            </div>
          </button>
        </div>
      </section>
    </motion.div>
  );
};
