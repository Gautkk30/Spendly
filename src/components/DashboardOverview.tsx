import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../data/defaultData';
import { formatIndianNumber } from '../utils/format';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  PieChart as PieIcon,
  FolderMinus,
  Edit2,
  Trash2,
  Copy
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line 
} from 'recharts';
import { motion } from 'motion/react';
import DynamicIcon from './Icons';
import { AnimatedCounter } from './AnimatedCounter';

const cardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 18
    }
  }
};

const textRevealVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

interface DashboardOverviewProps {
  onOpenAddTx: () => void;
  onEditTx: (tx: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onOpenAddTx, onEditTx }) => {
  const { 
    transactions, 
    categories, 
    wallets, 
    currency, 
    goals, 
    deleteTransaction, 
    addTransaction,
    theme,
    user,
    budgets
  } = useApp();

  const [activeTab, setActiveTab] = useState<'daily' | 'analytics'>('daily');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '12m'>('30d');

  const isLight = theme === 'light';
  const symbol = CURRENCIES[currency]?.symbol || '$';
  const currentRate = CURRENCIES[currency]?.rate || 1.0;

  // Convert USD to user default currency
  const convertAmount = (amountInUSD: number) => {
    return amountInUSD * currentRate;
  };

  // Format using new formatIndianNumber utility
  const formatVal = (val: number) => {
    return formatIndianNumber(val, currency);
  };

  // ------------------------------------------
  // TODAY'S DAILY STATS CALCULATIONS
  // ------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  let todayIncomeUSD = 0;
  let todayExpenseUSD = 0;

  transactions.forEach((tx) => {
    if (tx.date === todayStr) {
      const wallet = wallets.find(w => w.id === tx.walletId);
      const walletCurrency = wallet?.currency || 'USD';
      const rateToUSD = CURRENCIES[walletCurrency]?.rate || 1.0;
      const amountInUSD = tx.amount / rateToUSD;
      if (tx.type === 'income') {
        todayIncomeUSD += amountInUSD;
      } else {
        todayExpenseUSD += amountInUSD;
      }
    }
  });

  const todayIncome = convertAmount(todayIncomeUSD);
  const todayExpense = convertAmount(todayExpenseUSD);
  const todaySavings = todayIncome - todayExpense;

  // ------------------------------------------
  // CUMULATIVE MONTHLY STATS CALCULATIONS
  // ------------------------------------------
  let totalIncomeUSD = 0;
  let totalExpenseUSD = 0;

  transactions.forEach((tx) => {
    const wallet = wallets.find(w => w.id === tx.walletId);
    const walletCurrency = wallet?.currency || 'USD';
    const rateToUSD = CURRENCIES[walletCurrency]?.rate || 1.0;
    const amountInUSD = tx.amount / rateToUSD;
    
    if (tx.type === 'income') {
      totalIncomeUSD += amountInUSD;
    } else {
      totalExpenseUSD += amountInUSD;
    }
  });

  const convertedIncome = convertAmount(totalIncomeUSD);
  const convertedExpense = convertAmount(totalExpenseUSD);
  const netSavings = convertedIncome - convertedExpense;
  const savingsRate = convertedIncome > 0 ? (netSavings / convertedIncome) * 100 : 0;

  // ------------------------------------------
  // CHART DATA PREPARATION
  // ------------------------------------------
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    
    if (timeRange === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        let dailyIncUSD = 0;
        let dailyExpUSD = 0;

        transactions.forEach(t => {
          if (t.date === dateStr) {
            const wallet = wallets.find(w => w.id === t.walletId);
            const rateToUSD = CURRENCIES[wallet?.currency || 'USD']?.rate || 1.0;
            const amtUSD = t.amount / rateToUSD;
            if (t.type === 'income') dailyIncUSD += amtUSD;
            else dailyExpUSD += amtUSD;
          }
        });

        data.push({
          name: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          Income: Math.round(convertAmount(dailyIncUSD)),
          Expense: Math.round(convertAmount(dailyExpUSD)),
          Savings: Math.round(convertAmount(dailyIncUSD - dailyExpUSD))
        });
      }
    } else if (timeRange === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        let dailyIncUSD = 0;
        let dailyExpUSD = 0;

        transactions.forEach(t => {
          if (t.date === dateStr) {
            const wallet = wallets.find(w => w.id === t.walletId);
            const rateToUSD = CURRENCIES[wallet?.currency || 'USD']?.rate || 1.0;
            const amtUSD = t.amount / rateToUSD;
            if (t.type === 'income') dailyIncUSD += amtUSD;
            else dailyExpUSD += amtUSD;
          }
        });

        data.push({
          name: d.toLocaleDateString([], { weekday: 'short' }),
          Income: Math.round(convertAmount(dailyIncUSD)),
          Expense: Math.round(convertAmount(dailyExpUSD)),
          Savings: Math.round(convertAmount(dailyIncUSD - dailyExpUSD))
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthNum = d.getMonth() + 1;
        const yearNum = d.getFullYear();
        
        let monthlyIncUSD = 0;
        let monthlyExpUSD = 0;

        transactions.forEach(t => {
          const tDate = new Date(t.date);
          if ((tDate.getMonth() + 1) === monthNum && tDate.getFullYear() === yearNum) {
            const wallet = wallets.find(w => w.id === t.walletId);
            const rateToUSD = CURRENCIES[wallet?.currency || 'USD']?.rate || 1.0;
            const amtUSD = t.amount / rateToUSD;
            if (t.type === 'income') monthlyIncUSD += amtUSD;
            else monthlyExpUSD += amtUSD;
          }
        });

        data.push({
          name: d.toLocaleDateString([], { month: 'short' }),
          Income: Math.round(convertAmount(monthlyIncUSD)),
          Expense: Math.round(convertAmount(monthlyExpUSD)),
          Savings: Math.round(convertAmount(monthlyIncUSD - monthlyExpUSD))
        });
      }
    }
    return data;
  };

  const chartData = generateChartData();

  // ------------------------------------------
  // CATEGORY DISTRIBUTION
  // ------------------------------------------
  const categorySpendingUSD: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const wallet = wallets.find(w => w.id === t.walletId);
      const rateToUSD = CURRENCIES[wallet?.currency || 'USD']?.rate || 1.0;
      categorySpendingUSD[t.categoryId] = (categorySpendingUSD[t.categoryId] || 0) + (t.amount / rateToUSD);
    }
  });

  const categoryChartData = Object.keys(categorySpendingUSD).map(catId => {
    const cat = categories.find(c => c.id === catId);
    return {
      id: catId,
      name: cat?.name || 'Other',
      value: Math.round(convertAmount(categorySpendingUSD[catId])),
      color: cat?.color || '#6b7280'
    };
  }).filter(c => c.value > 0);

  // Duplicate a transaction
  const handleDuplicate = async (tx: any) => {
    const dup = {
      walletId: tx.walletId,
      categoryId: tx.categoryId,
      amount: tx.amount,
      type: tx.type,
      date: new Date().toISOString().split('T')[0],
      merchant: `${tx.merchant} (Copy)`,
      note: tx.note,
      tags: tx.tags,
      isRecurring: false
    };
    await addTransaction(dup);
  };

  const cardStyle = isLight 
    ? 'p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm transition-all' 
    : 'p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 transition-all';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  // 1. Personalized Greeting based on Time of Day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // 2. Dynamic Financial Insights calculations
  const now = new Date();
  const currentMonthNum = now.getMonth(); // 0-11
  const currentYearNum = now.getFullYear();
  
  const prevMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
  const prevYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

  let curMonthExpenseUSD = 0;
  let prevMonthExpenseUSD = 0;

  transactions.forEach(t => {
    if (t.type === 'expense') {
      const tDate = new Date(t.date);
      const wallet = wallets.find(w => w.id === t.walletId);
      const rateToUSD = CURRENCIES[wallet?.currency || 'USD']?.rate || 1.0;
      const amtUSD = t.amount / rateToUSD;

      if (tDate.getMonth() === currentMonthNum && tDate.getFullYear() === currentYearNum) {
        curMonthExpenseUSD += amtUSD;
      } else if (tDate.getMonth() === prevMonthNum && tDate.getFullYear() === prevYearNum) {
        prevMonthExpenseUSD += amtUSD;
      }
    }
  });

  const curMonthExpense = convertAmount(curMonthExpenseUSD);
  const prevMonthExpense = convertAmount(prevMonthExpenseUSD);

  let expenseChangePercent = 0;
  let expenseChangeDirection: 'up' | 'down' | 'stable' = 'stable';
  if (prevMonthExpense > 0) {
    const diff = curMonthExpense - prevMonthExpense;
    expenseChangePercent = Math.abs(Math.round((diff / prevMonthExpense) * 100));
    expenseChangeDirection = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';
  }

  // Find top spending category
  let topCategoryName = '';
  let topCategoryPercentage = 0;
  if (categoryChartData.length > 0) {
    const sortedCats = [...categoryChartData].sort((a, b) => b.value - a.value);
    const highest = sortedCats[0];
    const totalSpending = categoryChartData.reduce((sum, c) => sum + c.value, 0);
    if (totalSpending > 0) {
      topCategoryName = highest.name;
      topCategoryPercentage = Math.round((highest.value / totalSpending) * 100);
    }
  }

  // Find goal closest to completion
  let bestGoalName = '';
  let bestGoalProgress = 0;
  if (goals && goals.length > 0) {
    let maxProg = -1;
    goals.forEach(g => {
      const prog = g.currentAmount / g.targetAmount;
      if (prog > maxProg && prog < 1.0) {
        maxProg = prog;
        bestGoalName = g.name;
        bestGoalProgress = Math.round(prog * 100);
      }
    });
  }

  // Check budget strain
  let strainedCategoryName = '';
  let strainedBudgetPercent = 0;
  if (budgets && budgets.length > 0) {
    let maxStrain = -1;
    budgets.forEach(b => {
      const prog = b.spent / b.amount;
      if (prog > maxStrain) {
        maxStrain = prog;
        const cat = categories.find(c => c.id === b.categoryId);
        strainedCategoryName = cat?.name || 'All';
        strainedBudgetPercent = Math.round(prog * 100);
      }
    });
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={cardContainerVariants}
      className="space-y-6"
    >
      {/* Welcome & Overview Header */}
      <motion.div variants={textRevealVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-1.5 ${titleStyle}`}>
            <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Gautham'}</span>
            <span className="animate-[wave_1.5s_infinite] origin-[70%_70%] inline-block">👋</span>
          </h1>
          <p className={`text-xs ${textMutedStyle}`}>
            Manage your cash flow with elegance and precision.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Segment Selector to Unclutter Home view */}
          <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-zinc-100/80 border-zinc-200' : 'bg-zinc-950 border-zinc-850'}`}>
            <button 
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'daily' 
                  ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-850 text-white border border-zinc-800/40'
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Today's Ledger
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'analytics' 
                  ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-850 text-white border border-zinc-800/40'
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Cumulative Analytics
            </button>
          </div>

          <button 
            onClick={onOpenAddTx}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
            }`}
          >
            Add Transaction
          </button>
        </div>
      </motion.div>

      {/* Dynamic Financial Insights Section */}
      <motion.div 
        variants={textRevealVariants}
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border ${
          isLight 
            ? 'bg-zinc-50/50 border-zinc-200/80' 
            : 'bg-zinc-900/10 border-zinc-850/60'
        }`}
      >
        {/* Insight 1: Spending Trend */}
        <div className="flex gap-3.5 items-start">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            expenseChangeDirection === 'down'
              ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'
              : expenseChangeDirection === 'up'
              ? 'text-red-500 bg-red-500/5 border-red-500/10'
              : 'text-zinc-500 bg-zinc-500/5 border-zinc-500/10'
          }`}>
            <TrendingUp size={16} className={expenseChangeDirection === 'down' ? 'rotate-180' : ''} />
          </div>
          <div>
            <h4 className={`text-xs font-bold leading-tight ${titleStyle}`}>
              {expenseChangeDirection === 'down' 
                ? 'Under Budget Trend' 
                : expenseChangeDirection === 'up' 
                ? 'Increased Outgoings' 
                : 'Consistent Spending'}
            </h4>
            <p className={`text-[11px] leading-relaxed mt-0.5 ${textMutedStyle}`}>
              {expenseChangePercent > 0 
                ? `You spent ${expenseChangePercent}% ${expenseChangeDirection === 'down' ? 'less' : 'more'} than last month.` 
                : 'Your monthly spending is matching previous trends.'}
            </p>
          </div>
        </div>

        {/* Insight 2: Largest Spending Category */}
        <div className="flex gap-3.5 items-start">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isLight ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-zinc-950/40 text-zinc-400 border-zinc-850'
          }`}>
            <PieIcon size={16} />
          </div>
          <div>
            <h4 className={`text-xs font-bold leading-tight ${titleStyle}`}>
              {topCategoryName ? 'Primary Outlay Category' : 'Calibrating Outlays'}
            </h4>
            <p className={`text-[11px] leading-relaxed mt-0.5 ${textMutedStyle}`}>
              {topCategoryName 
                ? `${topCategoryName} is your largest expense category, making up ${topCategoryPercentage}% of spending.` 
                : 'We are analyzing category groupings to identify outlays.'}
            </p>
          </div>
        </div>

        {/* Insight 3: Goals Closest to Completion or Budget Strain */}
        <div className="flex gap-3.5 items-start">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            strainedBudgetPercent > 90
              ? 'text-amber-500 bg-amber-500/5 border-amber-500/10'
              : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'
          }`}>
            {strainedBudgetPercent > 90 ? <FolderMinus size={16} /> : <Target size={16} />}
          </div>
          <div>
            <h4 className={`text-xs font-bold leading-tight ${titleStyle}`}>
              {strainedBudgetPercent > 90 ? 'Budget Threshold Reached' : bestGoalName ? 'Target Milestone Close' : 'Financial Guardrails'}
            </h4>
            <p className={`text-[11px] leading-relaxed mt-0.5 ${textMutedStyle}`}>
              {strainedBudgetPercent > 90 
                ? `You have consumed ${strainedBudgetPercent}% of your ${strainedCategoryName} monthly limit.` 
                : bestGoalName 
                ? `Your '${bestGoalName}' milestone is ${bestGoalProgress}% complete. Keep pushing!` 
                : 'All saving milestones and budget thresholds are in safe zones.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Conditionally render the active tab content to prevent visual clutter */}
      {activeTab === 'daily' ? (
        <div className="space-y-6">
          {/* Today's Stats Cards Row */}
          <motion.div 
            variants={cardContainerVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {/* Today's Income */}
            <motion.div variants={cardItemVariants} className={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Today's Income</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl tracking-tight mb-1 ${titleStyle}`}>
                  <AnimatedCounter value={todayIncome} />
                </div>
                <p className={`text-[10px] ${textMutedStyle}`}>Daily credited cash flows</p>
              </div>
            </motion.div>

            {/* Today's Expense */}
            <motion.div variants={cardItemVariants} className={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Today's Expense</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <ArrowDownLeft size={15} />
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl tracking-tight mb-1 text-red-500`}>
                  <AnimatedCounter value={todayExpense} />
                </div>
                <p className={`text-[10px] ${textMutedStyle}`}>Today's active outgoings</p>
              </div>
            </motion.div>

            {/* Monthly Net Savings */}
            <motion.div variants={cardItemVariants} className={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Monthly net savings</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <Sparkles size={15} />
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl tracking-tight mb-1 ${netSavings < 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  <AnimatedCounter value={netSavings} />
                </div>
                <p className={`text-[10px] ${textMutedStyle}`}>Accumulated monthly surplus</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Today's Activity Log */}
          <div className={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-0.5">
                <h3 className={`font-bold text-sm ${titleStyle}`}>Today's Active Entries</h3>
                <p className={`text-[10px] ${textMutedStyle}`}>Live ledger events logged on {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${
                    isLight ? 'border-zinc-100 text-zinc-400' : 'border-zinc-800/60 text-zinc-500'
                  }`}>
                    <th className="py-2">Merchant</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Account</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-zinc-100' : 'divide-zinc-800/40'}`}>
                  {transactions.filter(tx => tx.date === todayStr).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500">
                        <FolderMinus size={24} className="mx-auto text-zinc-400 mb-2" />
                        <span className="text-[10px] font-semibold">No transactions logged today.</span>
                      </td>
                    </tr>
                  ) : (
                    transactions.filter(tx => tx.date === todayStr).map((tx) => {
                      const cat = categories.find(c => c.id === tx.categoryId);
                      const wall = wallets.find(w => w.id === tx.walletId);
                      const isExpense = tx.type === 'expense';
                      return (
                        <tr key={tx.id} className="group hover:bg-zinc-500/[0.02]">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                              }`}>
                                <DynamicIcon name={cat?.icon || 'HelpCircle'} className={isLight ? 'text-zinc-600' : 'text-zinc-400'} size={14} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-semibold truncate ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{tx.merchant}</span>
                                <span className="text-[9px] text-zinc-400 mt-0.5">{new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold"
                              style={{ backgroundColor: `${cat?.color}12`, color: cat?.color }}
                            >
                              {cat?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                              {wall?.name || 'Cash'}
                            </span>
                          </td>
                          <td className={`py-3 text-right font-bold font-mono text-xs ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isExpense ? '-' : '+'}{formatIndianNumber(tx.amount, 'INR').replace(/^-/, '')}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDuplicate(tx)}
                                className={`p-1 rounded border cursor-pointer ${
                                  isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                <Copy size={10} />
                              </button>
                              <button 
                                onClick={() => onEditTx(tx)}
                                className={`p-1 rounded border cursor-pointer ${
                                  isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                <Edit2 size={10} />
                              </button>
                              <button 
                                onClick={() => deleteTransaction(tx.id)}
                                className={`p-1 rounded border cursor-pointer ${
                                  isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-950/50 hover:text-red-400'
                                }`}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/40">
              {transactions.filter(tx => tx.date === todayStr).length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <FolderMinus size={24} className="mx-auto text-zinc-400 mb-2" />
                  <span className="text-[10px] font-semibold">No transactions logged today.</span>
                </div>
              ) : (
                transactions.filter(tx => tx.date === todayStr).map((tx) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const wall = wallets.find(w => w.id === tx.walletId);
                  const isExpense = tx.type === 'expense';
                  return (
                    <div key={tx.id} className="py-3 px-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                          }`}>
                            <DynamicIcon name={cat?.icon || 'HelpCircle'} className={isLight ? 'text-zinc-600' : 'text-zinc-400'} size={14} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-bold truncate ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{tx.merchant}</span>
                            <span className="text-[9px] text-zinc-500">{new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`text-xs font-bold font-mono ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isExpense ? '-' : '+'}{formatIndianNumber(tx.amount, 'INR').replace(/^-/, '')}
                          </span>
                          <span className={`text-[9px] font-medium mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {wall?.name || 'Cash'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 pl-10">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${cat?.color}12`, color: cat?.color }}
                        >
                          {cat?.name || 'Uncategorized'}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleDuplicate(tx)}
                            className={`p-1 rounded border cursor-pointer ${
                              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <Copy size={10} />
                          </button>
                          <button 
                            onClick={() => onEditTx(tx)}
                            className={`p-1 rounded border cursor-pointer ${
                              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <Edit2 size={10} />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(tx.id)}
                            className={`p-1 rounded border text-red-500 cursor-pointer ${
                              isLight ? 'bg-red-50/10 border-red-500/10' : 'bg-red-500/5 border-red-500/10'
                            }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Monthly/Cumulative Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Cumulative Income */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Cumulative Income</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl tracking-tight mb-1 ${titleStyle}`}>
                  {formatVal(convertedIncome)}
                </div>
                <p className={`text-[10px] ${textMutedStyle}`}>All recorded credited capital</p>
              </div>
            </div>

            {/* Cumulative Expense */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Cumulative Expense</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <ArrowDownLeft size={15} />
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl tracking-tight mb-1 text-red-500`}>
                  {formatVal(convertedExpense)}
                </div>
                <p className={`text-[10px] ${textMutedStyle}`}>All recorded outflows</p>
              </div>
            </div>

            {/* Cumulative Net Savings */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Net Savings Base</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <Sparkles size={15} />
                </div>
              </div>
              <div>
                <div className={`font-bold text-xl tracking-tight mb-1 ${titleStyle}`}>
                  {formatVal(netSavings)}
                </div>
                <p className={`text-[10px] ${textMutedStyle}`}>Cumulative Savings Rate: {savingsRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${cardStyle}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="space-y-0.5">
                  <h3 className={`font-bold text-sm ${titleStyle}`}>Cash Flow Trends</h3>
                  <p className={`text-[10px] ${textMutedStyle}`}>Dynamic income/expense mapping over time</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex p-0.5 rounded-lg border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-850'}`}>
                    <button 
                      onClick={() => setChartType('area')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${chartType === 'area' ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'}`}
                    >
                      Area
                    </button>
                    <button 
                      onClick={() => setChartType('bar')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${chartType === 'bar' ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'}`}
                    >
                      Bar
                    </button>
                    <button 
                      onClick={() => setChartType('line')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${chartType === 'line' ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'}`}
                    >
                      Line
                    </button>
                  </div>

                  <select 
                    value={timeRange}
                    onChange={(e: any) => setTimeRange(e.target.value)}
                    className={`border text-[10px] font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer ${
                      isLight 
                        ? 'bg-white border-zinc-200 text-zinc-700' 
                        : 'bg-zinc-950 border-zinc-850 text-zinc-300'
                    }`}
                  >
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="12m">12 months</option>
                  </select>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.06}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.06}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke={isLight ? "#a1a1aa" : "#52525b"} fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke={isLight ? "#a1a1aa" : "#52525b"} fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#18181b', borderColor: isLight ? '#e4e4e7' : '#27272a', borderRadius: '12px', fontSize: '11px', color: isLight ? '#18181b' : '#f4f4f5' }}
                        labelStyle={{ color: isLight ? '#71717a' : '#a1a1aa', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInc)" name="Income" />
                      <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExp)" name="Expense" />
                    </AreaChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke={isLight ? "#a1a1aa" : "#52525b"} fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke={isLight ? "#a1a1aa" : "#52525b"} fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#18181b', borderColor: isLight ? '#e4e4e7' : '#27272a', borderRadius: '12px', fontSize: '11px', color: isLight ? '#18181b' : '#f4f4f5' }}
                        labelStyle={{ color: isLight ? '#71717a' : '#a1a1aa', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} name="Income" />
                      <Bar dataKey="Expense" fill="#ef4444" radius={[3, 3, 0, 0]} name="Expense" />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke={isLight ? "#a1a1aa" : "#52525b"} fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke={isLight ? "#a1a1aa" : "#52525b"} fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#18181b', borderColor: isLight ? '#e4e4e7' : '#27272a', borderRadius: '12px', fontSize: '11px', color: isLight ? '#18181b' : '#f4f4f5' }}
                        labelStyle={{ color: isLight ? '#71717a' : '#a1a1aa', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={1.5} dot={false} name="Income" />
                      <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Expense" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Category Distribution */}
            <div className={cardStyle}>
              <div className="space-y-0.5 mb-6">
                <h3 className={`font-bold text-sm ${titleStyle}`}>Category Breakdown</h3>
                <p className={`text-[10px] ${textMutedStyle}`}>Distribution of cumulative expense allocations</p>
              </div>

              {categoryChartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                  <PieIcon size={24} className="text-zinc-400 mb-2" />
                  <span className="text-[10px]">No expense data logged yet.</span>
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full">
                  <div className="h-40 w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [formatIndianNumber(value, currency), 'Amount']}
                          contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#18181b', borderColor: isLight ? '#e4e4e7' : '#27272a', borderRadius: '12px', fontSize: '11px', color: isLight ? '#18181b' : '#f4f4f5' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Custom Legends list */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[10px] max-h-36 overflow-y-auto">
                    {categoryChartData.slice(0, 4).map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                        <span className="text-zinc-600 dark:text-zinc-300 truncate">{cat.name}</span>
                        <span className="text-zinc-400 font-semibold font-mono shrink-0 ml-auto">{formatIndianNumber(cat.value, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budgets / Savings Goals Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goals progress module */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-0.5">
                  <h3 className={`font-bold text-sm ${titleStyle}`}>Savings Milestones</h3>
                  <p className={`text-[10px] ${textMutedStyle}`}>Progress towards established targets</p>
                </div>
                <Target size={15} className="text-zinc-400" />
              </div>

              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center p-6 text-[10px] text-zinc-500">
                    No active goals established.
                  </div>
                ) : (
                  goals.slice(0, 3).map((goal) => {
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    return (
                      <div key={goal.id} className={`space-y-1.5 p-3.5 rounded-xl border ${
                        isLight ? 'bg-zinc-50/50 border-zinc-200/60' : 'bg-zinc-950/40 border-zinc-850'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className={titleStyle}>{goal.name}</span>
                          <span className={`${isLight ? 'text-zinc-600' : 'text-zinc-300'} font-mono`}>{progress.toFixed(0)}%</span>
                        </div>
                        
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isLight ? 'bg-zinc-200' : 'bg-zinc-800'
                        }`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              progress >= 100 
                                ? 'bg-emerald-500' 
                                : 'bg-zinc-900 dark:bg-zinc-300'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-[9px] font-semibold text-zinc-400 font-mono">
                          <span>{formatIndianNumber(goal.currentAmount, currency)} saved</span>
                          <span>Target: {formatIndianNumber(goal.targetAmount, currency)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* General Instructions Card */}
            <div className={`${cardStyle} flex flex-col justify-center text-center p-6 space-y-3`}>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Sparkles size={18} />
              </div>
              <h4 className={`font-bold text-sm ${titleStyle}`}>Spendly Smarter Tracker</h4>
              <p className={`text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed`}>
                To maintain a perfectly balanced budget, ensure that your monthly outgoings never exceed 70% of your total credited income.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardOverview;
