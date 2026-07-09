import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Wallet, 
  Category, 
  Transaction, 
  Budget, 
  Goal, 
  Notification, 
  CurrencyCode 
} from '../types';

interface AppContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  currency: CurrencyCode;
  activeView: string;
  globalSearch: string;
  isLoading: boolean;
  error: string | null;
  
  // Branding, config & login actions
  appName: string;
  appLogo: string;
  updateAppConfig: (appName: string, appLogo: string) => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
  
  // Actions
  fetchData: () => Promise<void>;
  updateUser: (update: Partial<UserProfile>) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, update: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  bulkDeleteTransactions: (ids: string[]) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'month' | 'year' | 'spent'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, update: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  runOCR: (imageBase64: string) => Promise<any>;
  
  setTheme: (theme: 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst') => void;
  setCurrency: (currency: CurrencyCode) => void;
  setActiveView: (view: string) => void;
  setGlobalSearch: (search: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const isAuthenticated = !!user;
  const token = null; // Token is stored securely in HttpOnly cookies
  
  const [appName, setAppName] = useState<string>('Spendly');
  const [appLogo, setAppLogo] = useState<string>('');

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst'>('dark');
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch app branding configurations first (available publicly)
      try {
        const configRes = await fetch('/api/config').then(r => r.json());
        setAppName(configRes.appName || 'Spendly');
        setAppLogo(configRes.appLogo || '');
      } catch (e) {
        console.error('Failed to fetch app branding configuration:', e);
      }

      // 2. Fetch current logged in user from verified session
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        // Not authenticated
        setUser(null);
        setWallets([]);
        setCategories([]);
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setNotifications([]);
        setIsLoading(false);
        return;
      }
      const meUser = await meRes.json();
      setUser({ ...meUser, defaultCurrency: 'INR' });

      // 3. Fetch private ledger data
      const [walletsRes, categoriesRes, txRes, budgetsRes, goalsRes, notifRes] = await Promise.all([
        fetch('/api/wallets').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/transactions').then(r => r.json()),
        fetch('/api/budgets').then(r => r.json()),
        fetch('/api/goals').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json())
      ]);

      // Force all currency definitions to INR and scale USD metrics accordingly
      const walletsInINR = (walletsRes || []).map((w: any) => {
        if (w.currency !== 'INR') {
          return {
            ...w,
            currency: 'INR',
            balance: Math.round(w.balance * 83.4 * 100) / 100
          };
        }
        return w;
      });

      const transactionsInINR = (txRes || []).map((tx: any) => {
        const correspondingWallet = walletsRes?.find((w: any) => w.id === tx.walletId);
        if (correspondingWallet && correspondingWallet.currency !== 'INR') {
          return {
            ...tx,
            amount: Math.round(tx.amount * 83.4 * 100) / 100
          };
        }
        return tx;
      });

      const budgetsInINR = (budgetsRes || []).map((b: any) => {
        if (b.amount < 5000) {
          return {
            ...b,
            amount: Math.round(b.amount * 83.4),
            spent: Math.round(b.spent * 83.4)
          };
        }
        return b;
      });

      const goalsInINR = (goalsRes || []).map((g: any) => {
        if (g.targetAmount < 30000) {
          return {
            ...g,
            targetAmount: Math.round(g.targetAmount * 83.4),
            currentAmount: Math.round(g.currentAmount * 83.4)
          };
        }
        return g;
      });

      setWallets(walletsInINR);
      setCategories(categoriesRes);
      setTransactions(transactionsInINR);
      setBudgets(budgetsInINR);
      setGoals(goalsInINR);
      setNotifications(notifRes);

      if (meUser.theme) {
        setThemeState(meUser.theme);
      }
      setCurrencyState('INR'); // Lock to INR
    } catch (err: any) {
      console.error('Failed to fetch data from API:', err);
      setError('Connection to backend failed. Please check if the dev server is fully loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for OAuth Success callbacks from popup windows
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
        fetchData();
      }
    };
    
    window.addEventListener('message', handleAuthMessage);
    fetchData(); // Fetch initial session status on mount

    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  const updateAppConfig = async (newAppName: string, newAppLogo: string) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ appName: newAppName, appLogo: newAppLogo })
      });
      const data = await res.json();
      setAppName(data.appName || 'Spendly');
      setAppLogo(data.appLogo || '');
      
      // Update browser tab title dynamically
      document.title = data.appName || 'Spendly';
    } catch (e) {
      console.error('Error updating app config:', e);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/url');
      const data = await res.json();
      
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        data.url, 
        'google_oauth_signin', 
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
      
      if (!popup) {
        throw new Error('Popup blocked! Please allow popups to sign in with Google.');
      }
    } catch (e: any) {
      console.error('Google account sign-in failed:', e);
      setError(e.message || 'Failed to initialize Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }

    setUser(null);
    setWallets([]);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setNotifications([]);
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setIsLoading(false);
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst') => {
    setThemeState(newTheme);
    if (user) {
      updateUser({ theme: newTheme });
    }
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    if (user) {
      updateUser({ defaultCurrency: newCurrency });
    }
  };

  const updateUser = async (update: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(update)
      });
      const updated = await res.json();
      setUser(updated);
    } catch (e) {
      console.error('Error updating user profile:', e);
    }
  };

  const addWallet = async (wallet: Omit<Wallet, 'id'>) => {
    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(wallet)
      });
      const newWallet = await res.json();
      setWallets(prev => [...prev, newWallet]);
    } catch (e) {
      console.error('Error adding wallet:', e);
    }
  };

  const deleteWallet = async (id: string) => {
    try {
      await fetch(`/api/wallets/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      setWallets(prev => prev.filter(w => w.id !== id));
      fetchData();
    } catch (e) {
      console.error('Error deleting wallet:', e);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(category)
      });
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
    } catch (e) {
      console.error('Error adding category:', e);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Error deleting category:', e);
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tx)
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      await fetchData();
    } catch (e) {
      console.error('Error adding transaction:', e);
    }
  };

  const updateTransaction = async (id: string, update: Partial<Transaction>) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(update)
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      await fetchData();
    } catch (e) {
      console.error('Error updating transaction:', e);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
      await fetchData();
    } catch (e) {
      console.error('Error deleting transaction:', e);
    }
  };

  const bulkDeleteTransactions = async (ids: string[]) => {
    try {
      const res = await fetch('/api/transactions/bulk-delete', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error('Failed to bulk delete');
      await fetchData();
    } catch (e) {
      console.error('Error bulk deleting transactions:', e);
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'month' | 'year' | 'spent'>) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(budget)
      });
      if (!res.ok) throw new Error('Failed to add budget');
      await fetchData();
    } catch (e) {
      console.error('Error adding budget:', e);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await fetch(`/api/budgets/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error('Error deleting budget:', e);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goal)
      });
      const newGoal = await res.json();
      setGoals(prev => [...prev, newGoal]);
    } catch (e) {
      console.error('Error adding goal:', e);
    }
  };

  const updateGoal = async (id: string, update: Partial<Goal>) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(update)
      });
      if (!res.ok) throw new Error('Failed to update goal');
      await fetchData();
    } catch (e) {
      console.error('Error updating goal:', e);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      console.error('Error deleting goal:', e);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { 
        method: 'PUT',
        headers: getHeaders()
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Error reading notification:', e);
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch('/api/notifications', { 
        method: 'DELETE',
        headers: getHeaders()
      });
      setNotifications([]);
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  const runOCR = async (imageBase64: string) => {
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ imageBase64 })
      });
      if (!res.ok) throw new Error('OCR process failed');
      return await res.json();
    } catch (e: any) {
      console.error('OCR run error:', e);
      throw e;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      isAuthenticated,
      wallets,
      categories,
      transactions,
      budgets,
      goals,
      notifications,
      theme,
      currency,
      activeView,
      globalSearch,
      isLoading,
      error,
      
      appName,
      appLogo,
      updateAppConfig,
      login,
      logout,
      
      fetchData,
      updateUser,
      addWallet,
      deleteWallet,
      addCategory,
      deleteCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      bulkDeleteTransactions,
      addBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      markNotificationRead,
      clearNotifications,
      runOCR,
      
      setTheme,
      setCurrency,
      setActiveView,
      setGlobalSearch
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
