import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, PieChart, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatIndianNumber } from '../utils/format';
import { motion } from 'motion/react';
import { EmptyState } from './EmptyState';
import { SkeletonLoader } from './SkeletonLoader';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
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

export const BudgetsView: React.FC = () => {
  const { budgets, categories, addBudget, deleteBudget, transactions, theme, isLoading } = useApp();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const isLight = theme === 'light';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-zinc-200/60 dark:bg-zinc-900/60 animate-pulse" />
            <div className="h-4 w-72 rounded bg-zinc-200/60 dark:bg-zinc-900/60 animate-pulse" />
          </div>
        </div>
        <SkeletonLoader variant="list" count={1} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert('Please select a category');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }

    await addBudget({
      categoryId,
      amount: Number(amount),
      period
    });

    setAmount('');
    setCategoryId('');
  };

  // Pre-calculate real spent values from current active month transactions
  const getSpentForCategory = (catId: string) => {
    return transactions
      .filter(t => t.type === 'expense' && (catId === 'all' || t.categoryId === catId))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const cardStyle = isLight 
    ? 'p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm transition-all' 
    : 'p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 transition-all';

  const inputStyle = isLight 
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400' 
    : 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700';

  const selectStyle = isLight
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer'
    : 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 cursor-pointer';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* View Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className={`text-2xl font-bold tracking-tight ${titleStyle}`}>Monthly Guardrails</h1>
        <p className={`text-xs ${textMutedStyle}`}>Establish and monitor category spending ceilings to prevent leaks</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create budget form */}
        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={16} className={isLight ? 'text-zinc-700' : 'text-zinc-300'} />
            <h3 className={`font-bold text-sm ${titleStyle}`}>Configure Limit</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectStyle}
              >
                <option value="">Select category...</option>
                <option value="all">Overall General Budget</option>
                {categories.filter(c => c.type === 'expense').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Monthly Ceilings (₹)</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Time Frame</label>
              <select
                value={period}
                onChange={(e: any) => setPeriod(e.target.value)}
                className={selectStyle}
              >
                <option value="weekly">Weekly Budget</option>
                <option value="monthly">Monthly Budget</option>
                <option value="yearly">Yearly Budget</option>
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              Apply Limit
            </button>
          </form>
        </div>

        {/* Right Column: Budgets Progress Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`text-xs font-semibold uppercase tracking-wider ${textMutedStyle}`}>Ceiling Audits</div>
          
          {budgets.length === 0 ? (
            <EmptyState 
              icon={PieChart}
              title="No budget guardrails established"
              description="Establish custom category budget limits on the left to monitor expenses, prevent overspending, and flag warning thresholds automatically."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((b) => {
                const cat = categories.find(c => c.id === b.categoryId);
                const spent = getSpentForCategory(b.categoryId);
                const remaining = Math.max(0, b.amount - spent);
                const percent = Math.min(100, (spent / b.amount) * 100);
                const overspent = spent > b.amount;
                const warning = spent >= b.amount * 0.8 && spent <= b.amount;

                return (
                  <div 
                    key={b.id} 
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      overspent 
                        ? 'border-red-500/30 bg-red-500/[0.01]' 
                        : warning 
                          ? 'border-amber-500/30 bg-amber-500/[0.01]' 
                          : isLight 
                            ? 'bg-white border-zinc-200' 
                            : 'bg-zinc-900/30 border-zinc-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#3b82f6' }} />
                          <span className={`font-bold text-sm ${titleStyle}`}>{cat?.name || 'General Overall'}</span>
                          <span className={`text-[10px] uppercase font-mono tracking-wider ${textMutedStyle}`}>({b.period})</span>
                        </div>

                        <button 
                          onClick={() => deleteBudget(b.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isLight 
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-red-500' 
                              : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-red-400'
                          }`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Progress visual bar */}
                      <div className="space-y-1.5">
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isLight ? 'bg-zinc-100' : 'bg-zinc-950'
                        }`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              overspent 
                                ? 'bg-red-500' 
                                : warning 
                                  ? 'bg-amber-500' 
                                  : 'bg-zinc-900 dark:bg-zinc-300'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className={`${isLight ? 'text-zinc-600' : 'text-zinc-400'} font-mono`}>{formatIndianNumber(spent, 'INR')} spent</span>
                          <span className="text-zinc-400 font-mono">Limit: {formatIndianNumber(b.amount, 'INR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta warning notice */}
                    <div className={`mt-5 pt-3.5 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                      isLight ? 'border-zinc-100' : 'border-zinc-800/40'
                    }`}>
                      {overspent ? (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertTriangle size={11} /> Overspent by {formatIndianNumber(spent - b.amount, 'INR')}
                        </span>
                      ) : warning ? (
                        <span className="text-amber-500 flex items-center gap-1">
                          <AlertTriangle size={11} /> Warning: Under 20% left
                        </span>
                      ) : (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Standing Optimal ({formatIndianNumber(remaining, 'INR')} left)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default BudgetsView;
