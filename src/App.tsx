import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { PageType, UserProfile, Language, Account, Transaction, NavItem } from './types';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { List } from './pages/List';
import { Stats } from './pages/Stats';
import { Assets } from './pages/Assets';
import { Profile } from './pages/Profile';
import { AddTransaction } from './pages/AddTransaction';
import { Login } from './pages/Login';
import { EditProfile } from './components/EditProfile';
import { AddAccountModal } from './components/AddAccountModal';
import { t } from './i18n';
import {
  apiGetProfile,
  apiUpdateProfile,
  apiGetAccounts,
  apiCreateAccount,
  apiUpdateAccount,
  apiGetTransactions,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiDeleteAccount,
  apiLogout,
  clearToken,
} from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [isAmountVisible, setIsAmountVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: 'dashboard', label: '首页', labelEn: 'Home', icon: 'home' },
    { id: 'list', label: '明细', labelEn: 'List', icon: 'receipt_long' },
    { id: 'stats', label: '统计', labelEn: 'Stats', icon: 'pie_chart' },
    { id: 'assets', label: '资产', labelEn: 'Assets', icon: 'account_balance_wallet' },
    { id: 'profile', label: '我的', labelEn: 'Me', icon: 'person' },
  ]);

  const [user, setUser] = useState<UserProfile>({
    name: '',
    avatar: '',
    membership: ''
  });

  // Check if already logged in (token exists)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Load data after login
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileData, accountsData, transactionsData] = await Promise.all([
        apiGetProfile(),
        apiGetAccounts(),
        apiGetTransactions(),
      ]);

      setUser({
        name: profileData.name || '',
        avatar: profileData.avatar || '',
        membership: profileData.membership || '普通会员',
      });
      setLanguage((profileData.language as Language) || 'zh');
      setAccounts(accountsData as Account[]);
      setTransactions(transactionsData as Transaction[]);
    } catch (err) {
      console.error('Failed to load data:', err);
      // Token might be expired, force re-login
      clearToken();
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn, loadData]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearToken();
      setIsLoggedIn(false);
      setAccounts([]);
      setTransactions([]);
      setUser({ name: '', avatar: '', membership: '' });
    }
  };

  const handleAddAccount = async (newAccount: Account) => {
    try {
      const created = await apiCreateAccount(newAccount);
      setAccounts(prev => [...prev, created as Account]);
    } catch (err) {
      console.error('Failed to create account:', err);
      // Fallback: still add to local state
      setAccounts(prev => [...prev, newAccount]);
    }
    setShowAddAccount(false);
  };

  const handleUpdateAccount = async (updatedAccount: Account) => {
    try {
      const updated = await apiUpdateAccount(updatedAccount.id, updatedAccount);
      setAccounts(prev => prev.map(acc => acc.id === updated.id ? updated as Account : acc));
    } catch (err) {
      console.error('Failed to update account:', err);
      setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    }
    setEditingAccount(null);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const created = await apiCreateTransaction(newTx as any);
      setTransactions(prev => [created as Transaction, ...prev]);

      // Update account balance locally
      setAccounts(prev => prev.map(acc => {
        const accountName = language === 'zh' ? acc.name : acc.nameEn;
        if (accountName === (created as Transaction).account) {
          const change = (created as Transaction).type === 'income' ? (created as Transaction).amount : -(created as Transaction).amount;
          return { ...acc, balance: acc.balance + change, lastChange: change };
        }
        return acc;
      }));
    } catch (err) {
      console.error('Failed to create transaction:', err);
      // Fallback: local only
      const tx: Transaction = { ...newTx, id: Date.now().toString() } as Transaction;
      setTransactions(prev => [tx, ...prev]);
    }
    setShowAdd(false);
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    try {
      const updated = await apiUpdateTransaction(updatedTx.id, updatedTx);
      setTransactions(prev => prev.map(tx => tx.id === updated.id ? updated as Transaction : tx));
      loadData(); // Sync account balances from DB triggers
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiDeleteTransaction(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      loadData(); // Sync account balances from DB triggers
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
    setEditingTransaction(null);
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await apiDeleteAccount(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      loadData(); // Sync all data
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
    setEditingAccount(null);
  };

  const handleUpdateProfile = async (updatedUser: UserProfile) => {
    try {
      await apiUpdateProfile({
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        membership: updatedUser.membership,
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
    setUser(updatedUser);
  };

  const handleToggleLanguage = async () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    try {
      await apiUpdateProfile({ language: newLang });
    } catch (err) {
      console.error('Failed to save language preference:', err);
    }
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      return <Login language={language} onLogin={handleLogin} />;
    }

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} language={language} transactions={transactions} accounts={accounts} isAmountVisible={isAmountVisible} onEditTransaction={setEditingTransaction} />;
      case 'list':
        return <List language={language} transactions={transactions} onEditTransaction={setEditingTransaction} />;
      case 'stats':
        return <Stats language={language} transactions={transactions} />;
      case 'assets':
        return (
          <Assets
            accounts={accounts}
            language={language}
            onAddAccount={() => setShowAddAccount(true)}
            onEditAccount={setEditingAccount}
            isAmountVisible={isAmountVisible}
            onToggleVisibility={() => setIsAmountVisible(!isAmountVisible)}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user}
            language={language}
            onEditProfile={() => setShowEditProfile(true)}
            onLogout={handleLogout}
            onToggleLanguage={handleToggleLanguage}
          />
        );
      default:
        return <Dashboard user={user} language={language} transactions={transactions} accounts={accounts} isAmountVisible={isAmountVisible} />;
    }
  };

  const handlePageChange = (page: PageType) => {
    if (page === 'add') {
      setShowAdd(true);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="relative flex h-screen w-full max-w-[430px] mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl border-x border-slate-200 dark:border-slate-800">
      {renderPage()}

      {isLoggedIn && !isLoading && (
        <BottomNav
          currentPage={currentPage}
          onPageChange={handlePageChange}
          language={language}
          navItems={navItems}
          onReorder={setNavItems}
        />
      )}

      <AnimatePresence>
        {(showAdd || editingTransaction) && (
          <AddTransaction
            language={language}
            onClose={() => {
              setShowAdd(false);
              setEditingTransaction(null);
            }}
            accounts={accounts}
            onAdd={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
            onDelete={editingTransaction ? () => handleDeleteTransaction(editingTransaction.id) : undefined}
            initialData={editingTransaction || undefined}
          />
        )}
        {showEditProfile && (
          <EditProfile
            user={user}
            language={language}
            onSave={handleUpdateProfile}
            onClose={() => setShowEditProfile(false)}
          />
        )}
        {(showAddAccount || editingAccount) && (
          <AddAccountModal
            language={language}
            onSave={editingAccount ? handleUpdateAccount : handleAddAccount}
            onDelete={editingAccount ? () => handleDeleteAccount(editingAccount.id) : undefined}
            onClose={() => {
              setShowAddAccount(false);
              setEditingAccount(null);
            }}
            initialData={editingAccount || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
