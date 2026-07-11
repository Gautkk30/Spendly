export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP' | 'AED' | 'JPY';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // exchange rate relative to USD
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // hex or tailwind class
  type: CategoryType;
  isCustom?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export type WalletType = 'cash' | 'bank' | 'card' | 'savings';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: WalletType;
  currency: CurrencyCode;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  amount: number; // in transaction's currency
  type: CategoryType;
  date: string; // ISO format YYYY-MM-DD
  merchant: string;
  note?: string;
  tags: string[];
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
  ocrExtracted?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Budget {
  id: string;
  categoryId: string; // or 'all' for overall budget
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  month: number; // 1-12
  year: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: 'vacation' | 'emergency' | 'laptop' | 'bike' | 'house' | 'savings';
  deadline: string; // YYYY-MM-DD
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  defaultCurrency: CurrencyCode;
  language: string;
  theme: 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst';
  notificationsEnabled: boolean;
  emailVerified: boolean;
  role?: 'admin' | 'user';
  createdAt?: string;
  lastLogin?: string;
  googleId?: string;
  notificationPreferences?: {
    emailDigest: boolean;
    soundTriggers: boolean;
    budgetThreshold: string;
    goalMilestones: boolean;
  };
  dashboardPreferences?: Record<string, any>;
  appearanceSettings?: Record<string, any>;
}
