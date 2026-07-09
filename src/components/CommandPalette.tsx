import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Terminal, 
  Layout, 
  Settings, 
  PlusCircle, 
  Sparkles, 
  Palette, 
  HelpCircle, 
  Eye, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  X,
  Keyboard,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatIndianNumber } from '../utils/format';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddTx: () => void;
  onOpenOCR: () => void;
  onStartTour: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  onOpenAddTx, 
  onOpenOCR,
  onStartTour
}) => {
  const { 
    theme, 
    setTheme, 
    activeView, 
    setActiveView, 
    transactions, 
    categories, 
    wallets, 
    addTransaction,
    currency,
    budgets,
    goals
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isQuickAddMode, setIsQuickAddMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Quick Add State
  const [qaAmount, setQaAmount] = useState('');
  const [qaMerchant, setQaMerchant] = useState('');
  const [qaType, setQaType] = useState<'expense' | 'income'>('expense');
  const [qaCategory, setQaCategory] = useState('');
  const [qaWallet, setQaWallet] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const qaAmountRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setIsQuickAddMode(false);
      setShowShortcuts(false);
      
      // Auto-set defaults for quick add
      setQaAmount('');
      setQaMerchant('');
      setQaType('expense');
      setQaCategory(categories.find(c => c.type === 'expense')?.id || categories[0]?.id || '');
      setQaWallet(wallets[0]?.id || '');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, categories, wallets]);

  const toggleTheme = () => {
    const list: ('light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst')[] = ['light', 'dark', 'midnight', 'forest', 'sunset', 'amethyst'];
    const idx = list.indexOf(theme);
    const nextTheme = list[(idx + 1) % list.length];
    setTheme(nextTheme);
  };

  // Keyboard shortcut listener within Command Palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isQuickAddMode) {
          setIsQuickAddMode(false);
          setTimeout(() => inputRef.current?.focus(), 50);
        } else if (showShortcuts) {
          setShowShortcuts(false);
          setTimeout(() => inputRef.current?.focus(), 50);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isQuickAddMode, showShortcuts, onClose]);

  // Command palette structured list items
  const baseCommands = [
    {
      id: 'nav-dash',
      title: 'Navigate to Dashboard',
      subtitle: 'View active networth, dynamic analytics and alerts',
      icon: Layout,
      shortcut: '1',
      action: () => { setActiveView('dashboard'); onClose(); }
    },
    {
      id: 'nav-tx',
      title: 'Navigate to Ledger Auditing',
      subtitle: 'Full list of transactions, search and bulk delete',
      icon: Terminal,
      shortcut: '2',
      action: () => { setActiveView('transactions'); onClose(); }
    },
    {
      id: 'nav-budgets',
      title: 'Navigate to Monthly Guardrails',
      subtitle: 'Setup and audit category spending limits',
      icon: Coins,
      shortcut: '3',
      action: () => { setActiveView('budgets'); onClose(); }
    },
    {
      id: 'nav-goals',
      title: 'Navigate to Savings Targets',
      subtitle: 'Fund saving milestones and project deadlines',
      icon: Sparkles,
      shortcut: '4',
      action: () => { setActiveView('goals'); onClose(); }
    },
    {
      id: 'nav-categories',
      title: 'Navigate to Category Registrations',
      subtitle: 'Coordinate visual colors, themes and icons',
      icon: Palette,
      shortcut: '5',
      action: () => { setActiveView('categories'); onClose(); }
    },
    {
      id: 'nav-settings',
      title: 'Navigate to App Configuration',
      subtitle: 'Manage SaaS branding and verify sessions',
      icon: Settings,
      shortcut: '6',
      action: () => { setActiveView('settings'); onClose(); }
    },
    {
      id: 'action-quick-add',
      title: 'Quick Add Transaction',
      subtitle: 'Instant inline ledger transaction compiler',
      icon: PlusCircle,
      shortcut: 'Q',
      action: () => { 
        setIsQuickAddMode(true);
        setTimeout(() => qaAmountRef.current?.focus(), 50);
      }
    },
    {
      id: 'action-ocr',
      title: 'Scan Receipt with AI',
      subtitle: 'Run optical character recognition on receipt invoice',
      icon: Sparkles,
      shortcut: 'R',
      action: () => { onOpenOCR(); onClose(); }
    },
    {
      id: 'action-theme',
      title: 'Switch Visual Theme Preset',
      subtitle: `Toggle current preset (${theme})`,
      icon: Palette,
      shortcut: 'T',
      action: () => { toggleTheme(); }
    },
    {
      id: 'action-tour',
      title: 'Start Welcome Walkthrough',
      subtitle: 'Guided interactive onboarding tour',
      icon: HelpCircle,
      shortcut: 'Shift + ?',
      action: () => { onStartTour(); onClose(); }
    },
    {
      id: 'action-shortcuts',
      title: 'Show Keyboard Shortcuts Help',
      subtitle: 'Full listing of quick key bindings',
      icon: Keyboard,
      shortcut: '?',
      action: () => { setShowShortcuts(true); }
    }
  ];

  // Filter commands by query
  const filteredCommands = query.trim() === '' 
    ? baseCommands 
    : baseCommands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) || 
        cmd.subtitle.toLowerCase().includes(query.toLowerCase())
      );

  const hasQuery = query.trim().length > 1;

  const matchingWallets = hasQuery
    ? wallets.filter(w => w.name.toLowerCase().includes(query.toLowerCase())).map(w => ({
        id: `wallet-${w.id}`,
        type: 'wallet',
        title: w.name,
        subtitle: `Wallet Account (${w.type.toUpperCase()})`,
        amountText: formatIndianNumber(w.balance, currency),
        action: () => { setActiveView('dashboard'); onClose(); }
      }))
    : [];

  const matchingGoals = hasQuery
    ? goals.filter(g => g.name.toLowerCase().includes(query.toLowerCase())).map(g => ({
        id: `goal-${g.id}`,
        type: 'goal',
        title: g.name,
        subtitle: `Savings Milestone (Saved: ${formatIndianNumber(g.currentAmount, currency)} / ${formatIndianNumber(g.targetAmount, currency)})`,
        amountText: `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
        action: () => { setActiveView('goals'); onClose(); }
      }))
    : [];

  const matchingCategories = hasQuery
    ? categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({
        id: `category-${c.id}`,
        type: 'category',
        title: c.name,
        subtitle: `Category Classification (${c.type.toUpperCase()})`,
        amountText: '',
        action: () => { setActiveView('categories'); onClose(); }
      }))
    : [];

  const matchingBudgets = hasQuery
    ? budgets.filter(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        return cat?.name.toLowerCase().includes(query.toLowerCase());
      }).map(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        return {
          id: `budget-${b.id}`,
          type: 'budget',
          title: `Budget Limit: ${cat?.name || 'All'}`,
          subtitle: `Limit: ${formatIndianNumber(b.amount, currency)} | Spent: ${formatIndianNumber(b.spent, currency)}`,
          amountText: `${Math.round((b.spent / b.amount) * 100)}%`,
          action: () => { setActiveView('budgets'); onClose(); }
        };
      })
    : [];

  const matchingTransactions = hasQuery
    ? transactions.filter(tx => 
        tx.merchant.toLowerCase().includes(query.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(query.toLowerCase()))
      ).map(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        return {
          id: `tx-${tx.id}`,
          type: tx.receiptUrl ? 'receipt' : 'transaction',
          title: tx.merchant,
          subtitle: `${tx.receiptUrl ? 'OCR Receipt Attached • ' : ''}${cat?.name || 'Uncategorized'} • ${tx.date}`,
          amountText: `${tx.type === 'expense' ? '-' : '+'}${formatIndianNumber(tx.amount, currency)}`,
          isExpense: tx.type === 'expense',
          action: () => { setActiveView('transactions'); onClose(); }
        };
      })
    : [];

  // Unified list for flat arrow and enter selection
  const allResults = [
    ...filteredCommands.map(c => ({ ...c, type: 'command' })),
    ...matchingWallets,
    ...matchingGoals,
    ...matchingCategories,
    ...matchingBudgets,
    ...matchingTransactions
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isQuickAddMode || showShortcuts) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults.length === 0) return;
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaAmount || isNaN(Number(qaAmount)) || Number(qaAmount) <= 0) {
      alert('Please enter a valid positive numeric amount');
      return;
    }
    if (!qaMerchant.trim()) {
      alert('Please enter a merchant / payee description');
      return;
    }

    try {
      await addTransaction({
        walletId: qaWallet,
        categoryId: qaCategory,
        amount: Number(qaAmount),
        type: qaType,
        date: new Date().toISOString().split('T')[0],
        merchant: qaMerchant.trim(),
        tags: [],
        isRecurring: false,
        ocrExtracted: false
      });
      setIsQuickAddMode(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to register fast ledger entry');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
        {/* Blur backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Palette Box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden relative z-10 ${
            isLight 
              ? 'bg-white border-zinc-200 text-zinc-900' 
              : 'bg-[#0e0e11] border-zinc-800 text-zinc-100'
          }`}
        >
          {/* 1. SHORTCUTS INFO VIEW */}
          {showShortcuts && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Keyboard size={18} className="text-emerald-500" />
                  <h3 className="font-bold text-sm">Keyboard Shortcuts Guide</h3>
                </div>
                <button 
                  onClick={() => { setShowShortcuts(false); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { keys: ['/', 'Cmd K'], label: 'Open Command Palette' },
                  { keys: ['N', 'T'], label: 'Open Add Transaction Form' },
                  { keys: ['R', 'S'], label: 'Open Receipt AI OCR Scanner' },
                  { keys: ['1', '2', '3'], label: 'View: Dash, Ledger, Limits' },
                  { keys: ['4', '5', '6'], label: 'View: Targets, Categories, Config' },
                  { keys: ['?'], label: 'Toggle Shortcuts Help Overlay' },
                  { keys: ['Esc'], label: 'Close Palette / Modals' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold">{item.label}</span>
                    <div className="flex gap-1">
                      {item.keys.map((k, i) => (
                        <kbd key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-sm text-zinc-600 dark:text-zinc-300">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setShowShortcuts(false); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="w-full mt-4 py-2 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl transition-all"
              >
                Go Back to Search
              </button>
            </div>
          )}

          {/* 2. QUICK ADD TRANSACTION MODE */}
          {isQuickAddMode && (
            <form onSubmit={handleQuickAddSubmit} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <PlusCircle size={18} className="text-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-sm">Quick Add Fast Transaction</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => { setIsQuickAddMode(false); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Toggle Expense / Income */}
              <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setQaType('expense');
                    setQaCategory(categories.find(c => c.type === 'expense')?.id || categories[0]?.id || '');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    qaType === 'expense'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQaType('income');
                    setQaCategory(categories.find(c => c.type === 'income')?.id || categories[0]?.id || '');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    qaType === 'income'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount and Merchant */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Amount</label>
                  <div className="relative">
                    <input
                      ref={qaAmountRef}
                      type="number"
                      required
                      placeholder="500"
                      value={qaAmount}
                      onChange={(e) => setQaAmount(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                        isLight
                          ? 'bg-zinc-100 hover:bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:ring-zinc-300'
                          : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 focus:border-zinc-700 focus:ring-zinc-700'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Payee / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="Coffee / Client payout"
                    value={qaMerchant}
                    onChange={(e) => setQaMerchant(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                      isLight
                        ? 'bg-zinc-100 hover:bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:ring-zinc-300'
                        : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 focus:border-zinc-700 focus:ring-zinc-700'
                    }`}
                  />
                </div>
              </div>

              {/* Category & Wallet */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Category</label>
                  <select
                    value={qaCategory}
                    onChange={(e) => setQaCategory(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                      isLight
                        ? 'bg-zinc-100 border-zinc-200 focus:border-zinc-300'
                        : 'bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    {categories.filter(c => c.type === qaType).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Wallet Account</label>
                  <select
                    value={qaWallet}
                    onChange={(e) => setQaWallet(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                      isLight
                        ? 'bg-zinc-100 border-zinc-200 focus:border-zinc-300'
                        : 'bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsQuickAddMode(false); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                    isLight 
                      ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600' 
                      : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
                >
                  <span>Compile Transaction</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          )}

          {/* 3. SEARCH & INTERACTIVE COMMAND LIST MODE */}
          {!showShortcuts && !isQuickAddMode && (
            <>
              {/* Query Input */}
              <div className="relative border-b border-zinc-100 dark:border-zinc-900 flex items-center px-4">
                <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search ledger..."
                  className="w-full pl-3 pr-10 py-4 text-sm bg-transparent outline-none border-none placeholder-zinc-500"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-3 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtered List Container */}
              <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
                {allResults.map((item: any, index) => {
                  const isSelected = index === selectedIndex;
                  
                  // Render grouping headings
                  const prevItem = allResults[index - 1];
                  const showHeading = !prevItem || prevItem.type !== item.type;
                  let headingLabel = '';
                  if (showHeading) {
                    if (item.type === 'command') headingLabel = 'System Commands';
                    else if (item.type === 'wallet') headingLabel = 'Wallet Accounts';
                    else if (item.type === 'goal') headingLabel = 'Savings Targets';
                    else if (item.type === 'category') headingLabel = 'Category Classifications';
                    else if (item.type === 'budget') headingLabel = 'Monthly Budget Limits';
                    else if (item.type === 'receipt') headingLabel = 'Receipt Matches';
                    else if (item.type === 'transaction') headingLabel = 'Ledger Transactions';
                  }

                  return (
                    <React.Fragment key={item.id || item.title + index}>
                      {headingLabel && (
                        <div className="px-3 pt-3 pb-1 text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 first:pt-1">
                          {headingLabel}
                        </div>
                      )}
                      
                      <button
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                          isSelected 
                            ? isLight ? 'bg-zinc-100' : 'bg-zinc-900/60' 
                            : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Visual Indicator Prefix */}
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center border text-xs shrink-0 font-bold ${
                            isSelected 
                              ? isLight ? 'bg-white text-zinc-900 border-zinc-200' : 'bg-zinc-950 text-white border-zinc-800'
                              : isLight ? 'bg-zinc-50 border-zinc-100 text-zinc-400' : 'bg-zinc-950/40 border-zinc-900/40 text-zinc-500'
                          }`}>
                            {item.type === 'command' && <Terminal size={12} />}
                            {item.type === 'wallet' && 'W'}
                            {item.type === 'goal' && 'G'}
                            {item.type === 'category' && 'C'}
                            {item.type === 'budget' && 'B'}
                            {item.type === 'receipt' && 'R'}
                            {item.type === 'transaction' && (item.isExpense ? '-' : '+')}
                          </div>
                          
                          <div className="min-w-0">
                            <div className={`text-xs font-bold truncate ${
                              isSelected ? 'text-zinc-900 dark:text-white' : isLight ? 'text-zinc-700' : 'text-zinc-300'
                            }`}>
                              {item.title}
                            </div>
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-none mt-0.5 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Right Hand Side Badge/Details */}
                        <div className="flex items-center gap-2 shrink-0">
                          {item.shortcut && (
                            <kbd className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded border shadow-sm ${
                              isSelected
                                ? isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-950 border-zinc-850 text-zinc-300'
                                : isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-500' : 'bg-zinc-950/60 border-zinc-900 text-zinc-500'
                            }`}>
                              {item.shortcut}
                            </kbd>
                          )}
                          
                          {item.amountText && (
                            <span className={`text-xs font-black font-mono ${
                              item.isExpense === true ? 'text-red-500' : item.isExpense === false ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {item.amountText}
                            </span>
                          )}
                        </div>
                      </button>
                    </React.Fragment>
                  );
                })}

                {/* Empty State */}
                {allResults.length === 0 && (
                  <div className="p-8 text-center text-zinc-400 dark:text-zinc-500">
                    <p className="text-xs font-semibold mb-1">No matching results found</p>
                    <p className="text-[10px] text-zinc-400">Try relaxing search terms or enter specific categories</p>
                  </div>
                )}
              </div>

              {/* Bottom Hotkey Footer */}
              <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-50/40 dark:bg-zinc-950/20">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">↓↑</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">Enter</kbd> Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">Esc</kbd> Close
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span>Press</span>
                  <kbd className="px-1 py-0.5 rounded border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">?</kbd>
                  <span>for shortcuts</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
