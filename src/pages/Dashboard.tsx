import React from 'react';
import { motion } from 'motion/react';
import { UserProfile, Language, Transaction, Account } from '../types';
import { t } from '../i18n';

interface DashboardProps {
  user: UserProfile;
  language: Language;
  transactions: Transaction[];
  accounts: Account[];
  isAmountVisible: boolean;
  onEditTransaction: (tx: Transaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, language, transactions, accounts, isAmountVisible, onEditTransaction }) => {
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  const formatAmount = (amount: number) => {
    if (!isAmountVisible) return '****';
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto pb-32"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="Avatar" className="size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" />
          <div>
            <h2 className="text-lg font-bold leading-tight">{t('dashboard', language)}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t('welcomeBack', language)}, {user.name}</p>
          </div>
        </div>
        <button className="size-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Balance Card */}
        <div className="flex flex-col gap-1 rounded-2xl p-6 bg-primary text-white shadow-lg shadow-primary/20">
          <div className="flex justify-between items-center mb-1">
            <p className="text-white/90 text-[11px] font-medium uppercase tracking-[0.05em]">
              {t('totalBalance', language)}
            </p>
            <span className="material-symbols-outlined text-white/70">account_balance_wallet</span>
          </div>
          <p className="text-white tracking-tight text-3xl font-bold leading-tight">{formatAmount(totalBalance)}</p>
          <div className="mt-4 flex items-center gap-2 bg-white/15 w-fit px-3 py-1.5 rounded-full text-[10px] font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+12.5% {t('vsLastMonth', language)}</span>
          </div>
        </div>

        {/* Budget Status */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t('budgetStatus', language)}</p>
              <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-none">{formatAmount(totalExpense)} <span className="text-slate-400 font-light text-sm ml-1">/ ¥12,000</span></p>
            </div>
            <p className="text-primary text-sm font-bold">{Math.round((totalExpense / 12000) * 100)}%</p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((totalExpense / 12000) * 100, 100)}%` }}></div>
          </div>
        </div>

        {/* Income/Expense Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-1 flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1.5">
              <span className="material-symbols-outlined text-[18px]">south_west</span>
              <p className="text-[10px] font-bold uppercase tracking-wider">{t('income', language)}</p>
            </div>
            <p className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">{formatAmount(totalIncome)}</p>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1.5">
              <span className="material-symbols-outlined text-[18px]">north_east</span>
              <p className="text-[10px] font-bold uppercase tracking-wider">{t('expense', language)}</p>
            </div>
            <p className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">{formatAmount(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-slate-100 text-base font-bold tracking-tight">{t('recentTransactions', language)}</h2>
          <button className="text-primary text-[11px] font-bold uppercase tracking-wider">{t('viewAll', language)}</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((t_item) => (
            <div 
              key={t_item.id} 
              onClick={() => onEditTransaction(t_item)}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-50 dark:border-slate-800 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div 
                className="flex items-center justify-center rounded-xl shrink-0 size-12"
                style={{ backgroundColor: `${t_item.categoryColor}20`, color: t_item.categoryColor }}
              >
                <span className="material-symbols-outlined">{t_item.categoryIcon}</span>
              </div>
              <div className="flex flex-col flex-1 justify-center">
                <p className="text-slate-900 dark:text-slate-100 text-[15px] font-medium leading-none mb-1.5">
                  {language === 'zh' ? t_item.category : t_item.category}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-light">{t_item.note || t_item.time} • {t_item.account}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-base font-bold ${t_item.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  {t_item.type === 'income' ? '+' : '-'}{formatAmount(t_item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
