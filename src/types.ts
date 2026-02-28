export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  account: string;
  note: string;
  time: string;
}

export interface Account {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  balance: number;
  icon: string;
  color: string;
  description?: string;
  trend?: number;
  status?: string;
  lastChange?: number;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
}

export type PageType = 'dashboard' | 'list' | 'stats' | 'assets' | 'profile' | 'add' | 'login';

export type Language = 'zh' | 'en';

export interface NavItem {
  id: PageType;
  label: string;
  labelEn: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  membership: string;
}

