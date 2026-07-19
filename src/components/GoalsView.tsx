import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Plus, Trash2, Calendar, Coins, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatIndianNumber } from '../utils/format';
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

export const GoalsView: React.FC = () => {
  const { goals, addGoal, deleteGoal, updateGoal, theme, isLoading } = useApp();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState<'vacation' | 'emergency' | 'laptop' | 'bike' | 'house' | 'savings'>('savings');
  const [deadline, setDeadline] = useState('');

  // Fund slider state
  const [fundingGoalId, setFundingGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState<string>('');

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
    if (!name.trim() || !targetAmount || !deadline) {
      alert('Please fill out all goal parameters');
      return;
    }

    await addGoal({
      name: name.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      category,
      deadline
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingGoalId) return;
    const goal = goals.find(g => g.id === fundingGoalId);
    if (!goal) return;

    const amt = Number(fundAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount to contribute');
      return;
    }

    const newAmount = goal.currentAmount + amt;
    await updateGoal(goal.id, { currentAmount: newAmount });
    
    setFundingGoalId(null);
    setFundAmount('');
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
        <h1 className={`text-2xl font-bold tracking-tight ${titleStyle}`}>Savings Targets</h1>
        <p className={`text-xs ${textMutedStyle}`}>Establish visual milestones, track deposits, and fulfill capital projects</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Target Form */}
        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-6">
            <Target size={16} className={isLight ? 'text-zinc-700' : 'text-zinc-300'} />
            <h3 className={`font-bold text-sm ${titleStyle}`}>Configure Milestone</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Milestone Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Winter Holiday"
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Target (₹)</label>
                <input 
                  type="number" 
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="5000"
                  className={`${inputStyle} font-mono`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Initial (₹)</label>
                <input 
                  type="number" 
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="1000"
                  className={`${inputStyle} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Icon Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className={selectStyle}
                >
                  <option value="vacation">Vacation ✈️</option>
                  <option value="emergency">Emergency 🛡️</option>
                  <option value="laptop">Gadgets 💻</option>
                  <option value="bike">Vehicle 🚲</option>
                  <option value="house">Real Estate 🏠</option>
                  <option value="savings">Savings 💰</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Deadline</label>
                <input 
                  type="date" 
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              Create Goal
            </button>
          </form>
        </div>

        {/* Right Column: Goal targets tracker list */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`text-xs font-semibold uppercase tracking-wider ${textMutedStyle}`}>Active Milestones</div>

          {goals.length === 0 ? (
            <EmptyState 
              icon={Target}
              title="No milestones established"
              description="Establish custom saving target targets to allocate funds, configure deadline milestones, and monitor your visual progress bar."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                const achieved = progress >= 100;

                return (
                  <div 
                    key={goal.id} 
                    className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all ${
                      achieved 
                        ? 'border-emerald-500/20 bg-emerald-500/[0.01]' 
                        : isLight 
                          ? 'bg-white border-zinc-200 hover:border-zinc-300' 
                          : 'bg-zinc-900/30 border-zinc-800/60 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* Top detail header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {goal.category === 'vacation' && '✈️'}
                            {goal.category === 'emergency' && '🛡️'}
                            {goal.category === 'laptop' && '💻'}
                            {goal.category === 'bike' && '🚲'}
                            {goal.category === 'house' && '🏠'}
                            {goal.category === 'savings' && '💰'}
                          </span>
                          <span className={`font-bold text-sm ${titleStyle}`}>{goal.name}</span>
                        </div>

                        <button 
                          onClick={() => deleteGoal(goal.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isLight 
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-red-500' 
                              : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-red-400'
                          }`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Visual progress bar */}
                      <div className="space-y-1.5 mb-5">
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isLight ? 'bg-zinc-100' : 'bg-zinc-950'
                        }`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              achieved 
                                ? 'bg-emerald-500' 
                                : 'bg-zinc-900 dark:bg-zinc-300'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className={`${isLight ? 'text-zinc-600' : 'text-zinc-400'} font-mono`}>{formatIndianNumber(goal.currentAmount, 'INR')} funded</span>
                          <span className="text-zinc-400 font-mono">Goal: {formatIndianNumber(goal.targetAmount, 'INR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deadline & deposit control row */}
                    <div className={`pt-3.5 border-t flex items-center justify-between gap-2 ${
                      isLight ? 'border-zinc-100' : 'border-zinc-800/40'
                    }`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${textMutedStyle}`}>
                        <Calendar size={10} /> Target: {goal.deadline}
                      </span>

                      {achieved ? (
                        <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          <Sparkles size={9} /> Achieved
                        </span>
                      ) : (
                        <button 
                          onClick={() => { setFundingGoalId(goal.id); setFundAmount(''); }}
                          className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                            isLight 
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <Coins size={10} /> Deposit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Contribute Fund Mini Modal */}
      <AnimatePresence>
        {fundingGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFundingGoalId(null)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`relative w-full max-w-sm border rounded-2xl shadow-xl p-6 z-10 space-y-4 ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-850'
              }`}
            >
              <h3 className={`font-bold text-sm flex items-center gap-2 ${titleStyle}`}>
                <Coins size={15} />
                <span>Deposit Capital</span>
              </h3>
              
              <form onSubmit={handleFundSubmit} className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Contribution Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    autoFocus
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="0.00"
                    className={`${inputStyle} font-mono`}
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setFundingGoalId(null)}
                    className={`flex-1 py-2 text-xs font-semibold border rounded-lg cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200' 
                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-[2] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default GoalsView;
