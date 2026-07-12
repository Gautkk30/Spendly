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
  theme: 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst';
  currency: CurrencyCode;
  activeView: string;
  globalSearch: string;
  isLoading: boolean;
  error: string | null;
  
  // Real-time Save & Connection feedback
  isSaving: 'idle' | 'saving' | 'saved';
  isOffline: boolean;
  deletedItems: {
    wallets: Wallet[];
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
  };
  undoItem: { id: string; type: string; label: string; countdown: number } | null;
  
  // Branding, config & login actions
  appName: string;
  appLogo: string;
  appFavicon: string;
  tagline: string;
  brandColors: { primary: string; secondary: string };
  updateAppConfig: (appName: string, appLogo: string, appFavicon?: string, tagline?: string, brandColors?: { primary: string; secondary: string }) => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
  
  // Actions
  fetchData: () => Promise<void>;
  getDeletedItems: () => Promise<void>;
  restoreItem: (type: string, id: string) => Promise<void>;
  permanentlyDeleteItem: (type: string, id: string) => Promise<void>;
  triggerUndo: () => Promise<void>;
  dismissUndo: () => void;
  
  updateUser: (update: Partial<UserProfile>) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  updateWallet: (id: string, update: Partial<Wallet>) => Promise<void>;
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
  isAddWalletOpen: boolean;
  setAddWalletOpen: (open: boolean) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (catId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const isAuthenticated = !!user;
  const token = null; // Token is stored securely in HttpOnly cookies and localStorage Bearer
  
  const [appName, setAppName] = useState<string>('Spendly');
  const [appLogo, setAppLogo] = useState<string>('');
  const [appFavicon, setAppFavicon] = useState<string>('');
  const [tagline, setTagline] = useState<string>('Smarter Wealth & Ledger Auditing Suite');
  const [brandColors, setBrandColors] = useState<{ primary: string; secondary: string }>({ primary: '#09090b', secondary: '#27272a' });

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
  const [isAddWalletOpen, setAddWalletOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Connection & Save State Indicators
  const [isSaving, setIsSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const q = localStorage.getItem('spendly_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  // Recycle Bin & Undo Manager States
  const [deletedItems, setDeletedItemsState] = useState<{
    wallets: Wallet[];
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
  }>({
    wallets: [],
    categories: [],
    transactions: [],
    budgets: [],
    goals: []
  });
  const [undoItem, setUndoItem] = useState<{ id: string; type: string; label: string; countdown: number } | null>(null);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const savedToken = localStorage.getItem('spendly_token');
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
    return headers;
  };

  const applyBranding = (name: string, logo: string, favicon?: string) => {
    const finalName = name || 'Spendly';
    document.title = finalName;
    let finalFavicon = favicon || logo;
    if (finalFavicon) {
      if (!finalFavicon.startsWith('data:')) {
        const separator = finalFavicon.includes('?') ? '&' : '?';
        finalFavicon = `${finalFavicon}${separator}cb=${Date.now()}`;
      }
      
      // Remove all existing favicon links to force browser to redraw the tab icon
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(l => {
        l.parentNode?.removeChild(l);
      });
      
      // Create and append a brand-new favicon link element
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = finalFavicon;
      document.head.appendChild(link);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch app branding configurations first
      try {
        const configRes = await fetch('/api/config', { headers: getHeaders() }).then(r => r.json());
        const finalName = configRes.applicationName || configRes.appName || 'Spendly';
        const finalLogo = configRes.logoUrl || configRes.appLogo || '';
        const finalFavicon = configRes.faviconUrl || configRes.appFavicon || '';
        const finalTagline = configRes.tagline || 'Smarter Wealth & Ledger Auditing Suite';
        const finalBrandColors = configRes.brandColors || { primary: '#09090b', secondary: '#27272a' };
        setAppName(finalName);
        setAppLogo(finalLogo);
        setAppFavicon(finalFavicon);
        setTagline(finalTagline);
        setBrandColors(finalBrandColors);
        applyBranding(finalName, finalLogo, finalFavicon);
      } catch (e) {
        console.error('Failed to fetch app branding configuration:', e);
      }

      // 2. Fetch current logged in user
      const meRes = await fetch('/api/auth/me', { headers: getHeaders() });
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

      // 3. Fetch private ledger data using custom auth header
      const [walletsRes, categoriesRes, txRes, budgetsRes, goalsRes, notifRes] = await Promise.all([
        fetch('/api/wallets', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/categories', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/transactions', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/budgets', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/goals', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/notifications', { headers: getHeaders() }).then(r => r.json())
      ]);

      const walletsInINR = walletsRes || [];
      const transactionsInINR = txRes || [];
      const budgetsInINR = budgetsRes || [];
      const goalsInINR = goalsRes || [];

      setWallets(walletsInINR);
      setCategories(categoriesRes);
      setTransactions(transactionsInINR);
      setBudgets(budgetsInINR);
      setGoals(goalsInINR);
      setNotifications(notifRes);

      if (meUser.theme) {
        setThemeState(meUser.theme);
      }
      setCurrencyState(meUser.defaultCurrency || 'INR');
      setUser({ ...meUser, defaultCurrency: meUser.defaultCurrency || 'INR' });
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
        if (event.data.token) {
          localStorage.setItem('spendly_token', event.data.token);
        }
        fetchData();
      }
    };
    
    window.addEventListener('message', handleAuthMessage);
    fetchData(); // Fetch initial session status on mount

    const pollConfig = async () => {
      try {
        const configRes = await fetch('/api/config', { headers: getHeaders() }).then(r => r.json());
        const finalName = configRes.applicationName || configRes.appName || 'Spendly';
        const finalLogo = configRes.logoUrl || configRes.appLogo || '';
        const finalFavicon = configRes.faviconUrl || configRes.appFavicon || finalLogo;
        const finalTagline = configRes.tagline || 'Smarter Wealth & Ledger Auditing Suite';
        const finalBrandColors = configRes.brandColors || { primary: '#09090b', secondary: '#27272a' };
        
        setAppName(prev => prev !== finalName ? finalName : prev);
        setAppLogo(prev => prev !== finalLogo ? finalLogo : prev);
        setAppFavicon(prev => prev !== finalFavicon ? finalFavicon : prev);
        setTagline(prev => prev !== finalTagline ? finalTagline : prev);
        setBrandColors(prev => {
          if (prev.primary !== finalBrandColors.primary || prev.secondary !== finalBrandColors.secondary) {
            return finalBrandColors;
          }
          return prev;
        });
        
        applyBranding(finalName, finalLogo, finalFavicon);
      } catch (e) {
        // Silently ignore polling errors
      }
    };

    const intervalId = setInterval(pollConfig, 4000);

    return () => {
      window.removeEventListener('message', handleAuthMessage);
      clearInterval(intervalId);
    };
  }, []);

  const updateAppConfig = async (newAppName: string, newAppLogo: string, newAppFavicon?: string, newTagline?: string, newBrandColors?: { primary: string; secondary: string }) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ 
          applicationName: newAppName, 
          logoUrl: newAppLogo, 
          faviconUrl: newAppFavicon || newAppLogo,
          tagline: newTagline,
          brandColors: newBrandColors
        })
      });
      const data = await res.json();
      const finalName = data.applicationName || data.appName || 'Spendly';
      const finalLogo = data.logoUrl || data.appLogo || '';
      const finalFavicon = data.faviconUrl || data.appFavicon || '';
      const finalTagline = data.tagline || 'Smarter Wealth & Ledger Auditing Suite';
      const finalBrandColors = data.brandColors || { primary: '#09090b', secondary: '#27272a' };
      setAppName(finalName);
      setAppLogo(finalLogo);
      setAppFavicon(finalFavicon);
      setTagline(finalTagline);
      setBrandColors(finalBrandColors);
      
      // Update browser tab title and favicon dynamically
      applyBranding(finalName, finalLogo, finalFavicon);
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
    
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_offline_queue');
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
    setIsSavingState('saving');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(update)
      });
      const updated = await res.json();
      setUser(updated);
      setIsSavingState('saved');
      setTimeout(() => setIsSavingState('idle'), 2000);
    } catch (e) {
      console.error('Error updating user profile:', e);
      setIsSavingState('idle');
    }
  };

  // Generic Mutation Executer with Offline Sync & Optimistic updates
  const executeMutation = async (
    url: string,
    method: string,
    body: any,
    optimisticAction: () => void
  ) => {
    setIsSavingState('saving');
    
    if (!navigator.onLine) {
      // Offline support - Optimistic update first, then queue
      optimisticAction();
      const op = { url, method, body, timestamp: Date.now() };
      const currentQueue = [...offlineQueue, op];
      setOfflineQueue(currentQueue);
      localStorage.setItem('spendly_offline_queue', JSON.stringify(currentQueue));
      
      setIsSavingState('saved');
      setTimeout(() => setIsSavingState('idle'), 2000);
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) throw new Error('API Request failed');
      
      setIsSavingState('saved');
      setTimeout(() => setIsSavingState('idle'), 2000);
      fetchData();
    } catch (err) {
      console.error('Network mutation failed, fallback to local offline queue:', err);
      optimisticAction();
      const op = { url, method, body, timestamp: Date.now() };
      const currentQueue = [...offlineQueue, op];
      setOfflineQueue(currentQueue);
      localStorage.setItem('spendly_offline_queue', JSON.stringify(currentQueue));
      
      setIsSavingState('saved');
      setTimeout(() => setIsSavingState('idle'), 2000);
    }
  };

  const syncOfflineQueue = async () => {
    try {
      const q = localStorage.getItem('spendly_offline_queue');
      const queue = q ? JSON.parse(q) : [];
      if (queue.length === 0) return;

      setIsSavingState('saving');
      for (const op of queue) {
        try {
          await fetch(op.url, {
            method: op.method,
            headers: getHeaders(),
            body: op.body ? JSON.stringify(op.body) : undefined
          });
        } catch (e) {
          console.error('Offline operation replay failed:', op, e);
        }
      }
      setOfflineQueue([]);
      localStorage.removeItem('spendly_offline_queue');
      setIsSavingState('saved');
      setTimeout(() => setIsSavingState('idle'), 2000);
      fetchData();
    } catch (e) {
      console.error('Failed to sync offline queue:', e);
    }
  };

  // Replay queue when connection returns
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Attempt startup sync
    if (navigator.onLine && offlineQueue.length > 0) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Undo Timer Loop
  useEffect(() => {
    if (!undoItem) return;
    const interval = setInterval(() => {
      setUndoItem(prev => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          clearInterval(interval);
          return null;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [undoItem]);

  const triggerUndoSetup = (id: string, type: string, label: string) => {
    setUndoItem({ id, type, label, countdown: 10 });
  };

  const triggerUndo = async () => {
    if (!undoItem) return;
    const currentUndo = undoItem;
    setUndoItem(null);
    await restoreItem(currentUndo.type, currentUndo.id);
  };

  const dismissUndo = () => {
    setUndoItem(null);
  };

  // Mutator actions utilizing the generic executeMutation wrapper
  const addWallet = async (wallet: Omit<Wallet, 'id'>) => {
    const optimisticAction = () => {
      setWallets(prev => [...prev, { ...wallet, id: `w-temp-${Date.now()}`, balance: Number(wallet.balance) } as any]);
    };
    await executeMutation('/api/wallets', 'POST', wallet, optimisticAction);
  };

  const updateWallet = async (id: string, update: Partial<Wallet>) => {
    const optimisticAction = () => {
      setWallets(prev => prev.map(w => w.id === id ? { ...w, ...update } : w));
    };
    await executeMutation(`/api/wallets/${id}`, 'PUT', update, optimisticAction);
  };

  const deleteWallet = async (id: string) => {
    const optimisticAction = () => {
      setWallets(prev => prev.filter(w => w.id !== id));
    };
    triggerUndoSetup(id, 'wallets', 'Wallet deleted');
    await executeMutation(`/api/wallets/${id}`, 'DELETE', null, optimisticAction);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const optimisticAction = () => {
      setCategories(prev => [...prev, { ...category, id: `c-temp-${Date.now()}` } as any]);
    };
    await executeMutation('/api/categories', 'POST', category, optimisticAction);
  };

  const deleteCategory = async (id: string) => {
    const optimisticAction = () => {
      setCategories(prev => prev.filter(c => c.id !== id));
    };
    triggerUndoSetup(id, 'categories', 'Category deleted');
    await executeMutation(`/api/categories/${id}`, 'DELETE', null, optimisticAction);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const optimisticAction = () => {
      setTransactions(prev => [{ ...tx, id: `tx-temp-${Date.now()}` } as any, ...prev]);
    };
    await executeMutation('/api/transactions', 'POST', tx, optimisticAction);
  };

  const updateTransaction = async (id: string, update: Partial<Transaction>) => {
    const optimisticAction = () => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
    };
    await executeMutation(`/api/transactions/${id}`, 'PUT', update, optimisticAction);
  };

  const deleteTransaction = async (id: string) => {
    const optimisticAction = () => {
      setTransactions(prev => prev.filter(t => t.id !== id));
    };
    triggerUndoSetup(id, 'transactions', 'Transaction deleted');
    await executeMutation(`/api/transactions/${id}`, 'DELETE', null, optimisticAction);
  };

  const bulkDeleteTransactions = async (ids: string[]) => {
    const optimisticAction = () => {
      setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    };
    await executeMutation('/api/transactions/bulk-delete', 'POST', { ids }, optimisticAction);
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'month' | 'year' | 'spent'>) => {
    const optimisticAction = () => {
      setBudgets(prev => [...prev, { ...budget, id: `b-temp-${Date.now()}`, spent: 0 } as any]);
    };
    await executeMutation('/api/budgets', 'POST', budget, optimisticAction);
  };

  const deleteBudget = async (id: string) => {
    const optimisticAction = () => {
      setBudgets(prev => prev.filter(b => b.id !== id));
    };
    triggerUndoSetup(id, 'budgets', 'Budget deleted');
    await executeMutation(`/api/budgets/${id}`, 'DELETE', null, optimisticAction);
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const optimisticAction = () => {
      setGoals(prev => [...prev, { ...goal, id: `g-temp-${Date.now()}` } as any]);
    };
    await executeMutation('/api/goals', 'POST', goal, optimisticAction);
  };

  const updateGoal = async (id: string, update: Partial<Goal>) => {
    const optimisticAction = () => {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...update } : g));
    };
    await executeMutation(`/api/goals/${id}`, 'PUT', update, optimisticAction);
  };

  const deleteGoal = async (id: string) => {
    const optimisticAction = () => {
      setGoals(prev => prev.filter(g => g.id !== id));
    };
    triggerUndoSetup(id, 'goals', 'Goal deleted');
    await executeMutation(`/api/goals/${id}`, 'DELETE', null, optimisticAction);
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

  // Recycle Bin action implementations
  const getDeletedItems = async () => {
    try {
      const res = await fetch('/api/recycle-bin', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDeletedItemsState(data);
      }
    } catch (e) {
      console.error('Failed to get deleted items from backend:', e);
    }
  };

  const restoreItem = async (type: string, id: string) => {
    setIsSavingState('saving');
    try {
      const res = await fetch('/api/recycle-bin/restore', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type, id })
      });
      if (res.ok) {
        setIsSavingState('saved');
        setTimeout(() => setIsSavingState('idle'), 2000);
        fetchData();
        getDeletedItems();
      }
    } catch (e) {
      console.error('Failed to restore item:', e);
      setIsSavingState('idle');
    }
  };

  const permanentlyDeleteItem = async (type: string, id: string) => {
    setIsSavingState('saving');
    try {
      const res = await fetch(`/api/recycle-bin/permanent/${type}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setIsSavingState('saved');
        setTimeout(() => setIsSavingState('idle'), 2000);
        getDeletedItems();
      }
    } catch (e) {
      console.error('Failed to permanently delete item:', e);
      setIsSavingState('idle');
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
      
      isSaving,
      isOffline,
      deletedItems,
      undoItem,
      
      appName,
      appLogo,
      appFavicon,
      tagline,
      brandColors,
      updateAppConfig,
      login,
      logout,
      
      fetchData,
      getDeletedItems,
      restoreItem,
      permanentlyDeleteItem,
      triggerUndo,
      dismissUndo,
      
      updateUser,
      addWallet,
      updateWallet,
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
      setGlobalSearch,
      isAddWalletOpen,
      setAddWalletOpen,
      mobileDrawerOpen,
      setMobileDrawerOpen,
      activeCategoryFilter,
      setActiveCategoryFilter
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
