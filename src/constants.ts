import { Transaction, Account, Category } from './types';

export const MOCK_ACCOUNTS: Account[] = [
  { id: '1', name: '现金', nameEn: 'Cash', type: 'Wallet', balance: 5200, icon: 'payments', color: '#10b981', description: '个人零钱、备用金', trend: 200 },
  { id: '2', name: '招商银行', nameEn: 'Bank', type: 'Savings', balance: 86400, icon: 'credit_card', color: '#137fec', description: '工资卡 (**** 8829)', status: '储蓄卡' },
  { id: '3', name: '支付宝', nameEn: 'Alipay', type: 'Digital', balance: 24150, icon: 'account_balance_wallet', color: '#0ea5e9', description: '余额宝 & 余额', status: '收益中' },
  { id: '4', name: '微信支付', nameEn: 'WeChat', type: 'Digital', balance: 12750, icon: 'chat_bubble', color: '#22c55e', description: '零钱通收益', status: '常用' },
];

export const CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', nameEn: 'Food', icon: 'restaurant', color: '#fb923c' },
  { id: 'shop', name: '购物', nameEn: 'Shop', icon: 'shopping_cart', color: '#60a5fa' },
  { id: 'travel', name: '交通', nameEn: 'Travel', icon: 'commute', color: '#4ade80' },
  { id: 'fun', name: '娱乐', nameEn: 'Fun', icon: 'movie', color: '#a855f7' },
  { id: 'home', name: '居住', nameEn: 'Home', icon: 'home', color: '#2dd4bf' },
  { id: 'health', name: '医疗', nameEn: 'Health', icon: 'medical_services', color: '#f87171' },
  { id: 'study', name: '教育', nameEn: 'Study', icon: 'school', color: '#facc15' },
  { id: 'more', name: '更多', nameEn: 'More', icon: 'more_horiz', color: '#94a3b8' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'expense',
    amount: 85.20,
    category: '餐饮',
    categoryIcon: 'restaurant',
    categoryColor: '#fb923c',
    date: '2026-02-26',
    time: '2026-02-26',
    account: '招商银行',
    note: '晚餐'
  },
  {
    id: 't2',
    type: 'income',
    amount: 500.00,
    category: '餐饮',
    categoryIcon: 'restaurant',
    categoryColor: '#fb923c',
    date: '2026-02-27',
    time: '2026-02-27',
    account: '微信支付',
    note: '退款'
  },
  {
    id: 't3',
    type: 'income',
    amount: 4200.00,
    category: '薪资转帐',
    categoryIcon: 'payments',
    categoryColor: '#10b981',
    date: '2026-02-21',
    time: '2026-02-21',
    account: '招商银行',
    note: '2月工资'
  },
  {
    id: 't4',
    type: 'expense',
    amount: 1240.00,
    category: '住房物业',
    categoryIcon: 'home',
    categoryColor: '#4f46e5',
    date: '2026-02-23',
    time: '2026-02-23',
    account: '支付宝',
    note: '房租'
  }
];
