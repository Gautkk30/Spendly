import { Category, Currency, Wallet, Transaction, Budget, Goal, Notification, UserProfile } from '../types';

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.4 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 156.2 }
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'cat-salary', name: 'Salary', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance', icon: 'Laptop', color: '#3b82f6', type: 'income' },
  { id: 'cat-investments', name: 'Investments', icon: 'TrendingUp', color: '#6366f1', type: 'income' },
  { id: 'cat-gifts', name: 'Gifts', icon: 'Gift', color: '#ec4899', type: 'income' },
  
  // Expense Categories
  { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b', type: 'expense' },
  { id: 'cat-housing', name: 'Housing & Rent', icon: 'Home', color: '#ef4444', type: 'expense' },
  { id: 'cat-transport', name: 'Transportation', icon: 'Car', color: '#06b6d4', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
  { id: 'cat-utilities', name: 'Utilities & Bills', icon: 'Zap', color: '#14b8a6', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-healthcare', name: 'Healthcare', icon: 'HeartPulse', color: '#10b981', type: 'expense' },
  { id: 'cat-travel', name: 'Travel', icon: 'Plane', color: '#3b82f6', type: 'expense' },
  { id: 'cat-misc', name: 'Miscellaneous', icon: 'HelpCircle', color: '#6b7280', type: 'expense' }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-101',
  name: 'Gautham K',
  email: 'gauthamkk30@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  defaultCurrency: 'INR',
  language: 'en',
  theme: 'dark',
  notificationsEnabled: true,
  emailVerified: true
};

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w-main', name: 'HDFC Checking', balance: 450000.00, type: 'bank', currency: 'INR' },
  { id: 'w-savings', name: 'ICICI Savings', balance: 1500000.00, type: 'bank', currency: 'INR' },
  { id: 'w-cash', name: 'Cash Wallet', balance: 30000.00, type: 'cash', currency: 'INR' },
  { id: 'w-credit', name: 'Amex Gold', balance: -100000.00, type: 'card', currency: 'INR' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    walletId: 'w-main',
    categoryId: 'cat-salary',
    amount: 375000.00,
    type: 'income',
    date: '2026-07-01',
    merchant: 'Google Inc.',
    note: 'Bi-weekly payroll',
    tags: ['work', 'salary'],
    isRecurring: true,
    recurringInterval: 'monthly'
  },
  {
    id: 'tx-2',
    walletId: 'w-credit',
    categoryId: 'cat-food',
    amount: 10350.00,
    type: 'expense',
    date: '2026-07-02',
    merchant: 'Whole Foods Market',
    note: 'Weekly grocery run',
    tags: ['groceries', 'food'],
    isRecurring: false
  },
  {
    id: 'tx-3',
    walletId: 'w-credit',
    categoryId: 'cat-housing',
    amount: 150000.00,
    type: 'expense',
    date: '2026-07-01',
    merchant: 'Avalon Apartments',
    note: 'Monthly rent payment',
    tags: ['rent', 'home'],
    isRecurring: true,
    recurringInterval: 'monthly'
  },
  {
    id: 'tx-4',
    walletId: 'w-main',
    categoryId: 'cat-freelance',
    amount: 70800.00,
    type: 'income',
    date: '2026-07-03',
    merchant: 'Upwork Global',
    note: 'Landing page design client project',
    tags: ['freelance', 'design'],
    isRecurring: false
  },
  {
    id: 'tx-5',
    walletId: 'w-credit',
    categoryId: 'cat-transport',
    amount: 3500.00,
    type: 'expense',
    date: '2026-07-04',
    merchant: 'Uber Inc.',
    note: 'Ride to downtown restaurant',
    tags: ['uber', 'transport'],
    isRecurring: false
  },
  {
    id: 'tx-6',
    walletId: 'w-credit',
    categoryId: 'cat-entertainment',
    amount: 649.00,
    type: 'expense',
    date: '2026-07-05',
    merchant: 'Netflix Inc.',
    note: 'Monthly subscription',
    tags: ['subscription', 'entertainment'],
    isRecurring: true,
    recurringInterval: 'monthly'
  },
  {
    id: 'tx-7',
    walletId: 'w-credit',
    categoryId: 'cat-shopping',
    amount: 20800.00,
    type: 'expense',
    date: '2026-07-06',
    merchant: 'Apple Store',
    note: 'HomePod Mini and charger',
    tags: ['gadgets', 'apple'],
    isRecurring: false
  },
  {
    id: 'tx-8',
    walletId: 'w-cash',
    categoryId: 'cat-food',
    amount: 1040.00,
    type: 'expense',
    date: '2026-07-07',
    merchant: 'Blue Bottle Coffee',
    note: 'Latte and croissant',
    tags: ['coffee', 'breakfast'],
    isRecurring: false
  },
  {
    id: 'tx-9',
    walletId: 'w-main',
    categoryId: 'cat-utilities',
    amount: 7100.00,
    type: 'expense',
    date: '2026-07-05',
    merchant: 'PG&E Electric',
    note: 'Electricity bill',
    tags: ['utilities', 'bills'],
    isRecurring: true,
    recurringInterval: 'monthly'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b-1', categoryId: 'cat-food', amount: 50000.00, spent: 11390.00, period: 'monthly', month: 7, year: 2026 },
  { id: 'b-2', categoryId: 'cat-shopping', amount: 30000.00, spent: 20800.00, period: 'monthly', month: 7, year: 2026 },
  { id: 'b-3', categoryId: 'cat-transport', amount: 15000.00, spent: 3500.00, period: 'monthly', month: 7, year: 2026 },
  { id: 'b-4', categoryId: 'cat-entertainment', amount: 10000.00, spent: 649.00, period: 'monthly', month: 7, year: 2026 }
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g-1', name: 'Japan Winter Getaway', targetAmount: 400000, currentAmount: 260000, category: 'vacation', deadline: '2026-12-15' },
  { id: 'g-2', name: 'Emergency Fund (6M)', targetAmount: 1200000, currentAmount: 1000000, category: 'emergency', deadline: '2026-09-30' },
  { id: 'g-3', name: 'M3 Pro MacBook Pro', targetAmount: 200000, currentAmount: 140000, category: 'laptop', deadline: '2026-08-01' }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'nt-1',
    title: 'Welcome to Spendly!',
    message: 'Start by configuring your wallets and setting your monthly budgets.',
    type: 'success',
    timestamp: '2026-07-08T06:00:00Z',
    read: false
  },
  {
    id: 'nt-2',
    title: 'Budget Alert',
    message: 'Your Shopping budget is at 62% of your monthly limit.',
    type: 'warning',
    timestamp: '2026-07-08T06:10:00Z',
    read: false
  }
];
