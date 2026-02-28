export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;       // Date in YYYY-MM-DD
  time: string;       // Original field matching date
  account: string;    // Name of account
  account_id?: string; // Foreign key back to account id
  note: string;
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

