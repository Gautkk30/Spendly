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

export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2309090b'><circle cx='50' cy='50' r='50' fill='%2309090b' stroke='%2327272a' stroke-width='2'/><path d='M50 25a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 38c-18 0-30 10-30 10v4h60v-4s-12-10-30-10z' fill='%23a1a1aa'/></svg>";

export const INITIAL_USER: UserProfile = {
  id: 'usr-101',
  name: 'Gautham K',
  email: 'gauthamkk30@gmail.com',
  avatarUrl: DEFAULT_AVATAR,
  defaultCurrency: 'INR',
  language: 'en',
  theme: 'dark',
  notificationsEnabled: true,
  emailVerified: true,
  role: 'admin'
};

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w-main', name: 'HDFC Checking', balance: 0.00, type: 'bank', currency: 'INR' },
  { id: 'w-savings', name: 'ICICI Savings', balance: 0.00, type: 'bank', currency: 'INR' },
  { id: 'w-cash', name: 'Cash Wallet', balance: 0.00, type: 'cash', currency: 'INR' },
  { id: 'w-credit', name: 'Amex Gold', balance: 0.00, type: 'card', currency: 'INR' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_GOALS: Goal[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];
