import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  ArrowLeftRight, 
  Wallet as WalletIcon, 
  FolderKanban, 
  PieChart, 
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './EmptyState';

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

export const RecycleBinView: React.FC = () => {
  const { 
    deletedItems, 
    getDeletedItems, 
    restoreItem, 
    permanentlyDeleteItem, 
    theme 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'transactions' | 'wallets' | 'categories' | 'budgets' | 'goals'>('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: string } | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    getDeletedItems();
  }, []);

  const cardStyle = isLight 
    ? 'p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm transition-all' 
    : 'p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 transition-all';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const tableBorder = isLight ? 'border-zinc-200' : 'border-zinc-800/50';

  const handleRestore = async (type: string, id: string) => {
    await restoreItem(type, id);
  };

  const handlePermanentDeleteClick = (type: string, id: string) => {
    setConfirmDelete({ id, type });
  };

  const executePermanentDelete = async () => {
    if (!confirmDelete) return;
    await permanentlyDeleteItem(confirmDelete.type, confirmDelete.id);
    setConfirmDelete(null);
  };

  // Counting metrics
  const txCount = deletedItems.transactions?.length || 0;
  const walletCount = deletedItems.wallets?.length || 0;
  const catCount = deletedItems.categories?.length || 0;
  const budgetCount = deletedItems.budgets?.length || 0;
  const goalCount = deletedItems.goals?.length || 0;
  const totalCount = txCount + walletCount + catCount + budgetCount + goalCount;

  const tabs = [
    { id: 'all', label: 'All Items', count: totalCount },
    { id: 'transactions', label: 'Transactions', count: txCount },
    { id: 'wallets', label: 'Wallets', count: walletCount },
    { id: 'categories', label: 'Categories', count: catCount },
    { id: 'budgets', label: 'Budgets', count: budgetCount },
    { id: 'goals', label: 'Goals', count: goalCount },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Title & Banner */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${titleStyle}`}>
            <Trash2 size={22} className="text-red-500 animate-pulse" />
            Recycle Bin
          </h1>
          <p className={`text-xs ${textMutedStyle}`}>
            Restore or permanently purge soft-deleted ledgers. Data will persist safely here until you explicitly clear it.
          </p>
        </div>
      </motion.div>

      {/* Warning Notice Banner */}
      <motion.div 
        variants={itemVariants}
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          isLight ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-amber-500/5 border-amber-500/15 text-amber-400'
        }`}
      >
        <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <div className="text-[11px] leading-relaxed">
          <strong className="font-semibold block mb-0.5">Permanent Retention Fallback Notice</strong>
          Spendly utilizes high-integrity soft delete layers. If you accidentally delete a balance ledger, card tracker, category schema, or saving goal, it goes into this secure sandboxed zone. Items here can be restored with 100% relational integrity.
        </div>
      </motion.div>

      {/* Tabs list bar */}
      <motion.div variants={itemVariants} className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 border ${
              activeTab === tab.id
                ? isLight 
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                  : 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md shadow-white/5'
                : isLight
                  ? 'bg-zinc-100/50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800'
                  : 'bg-zinc-900/30 text-zinc-400 border-zinc-800/40 hover:bg-zinc-900/60 hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              activeTab === tab.id
                ? isLight ? 'bg-white/20 text-white' : 'bg-zinc-950 text-zinc-200'
                : isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Primary Workspace List */}
      <motion.div variants={itemVariants} className="space-y-6">
        
        {/* ================= WALLETS SECTION ================= */}
        {(activeTab === 'all' || activeTab === 'wallets') && walletCount > 0 && (
          <div className={cardStyle}>
            <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 ${textMutedStyle}`}>
              <WalletIcon size={14} className="text-zinc-400" />
              Soft Deleted Wallets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${tableBorder} text-zinc-500 font-semibold`}>
                    <th className="pb-3 pr-4">Wallet Name</th>
                    <th className="pb-3 px-4">Original Balance</th>
                    <th className="pb-3 px-4">Deletion Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-800/30">
                  {deletedItems.wallets.map(w => (
                    <tr key={w.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-zinc-200 dark:text-zinc-100">{w.name}</td>
                      <td className="py-3.5 px-4 font-mono">₹{w.balance.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{formatDate(w.deletedAt)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleRestore('wallets', w.id)}
                            className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors cursor-pointer"
                            title="Restore Wallet"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteClick('wallets', w.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Permanently Delete Wallet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TRANSACTIONS SECTION ================= */}
        {(activeTab === 'all' || activeTab === 'transactions') && txCount > 0 && (
          <div className={cardStyle}>
            <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 ${textMutedStyle}`}>
              <ArrowLeftRight size={14} className="text-zinc-400" />
              Soft Deleted Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${tableBorder} text-zinc-500 font-semibold`}>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Allocation Type</th>
                    <th className="pb-3 px-4">Deletion Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-800/30">
                  {deletedItems.transactions.map(tx => (
                    <tr key={tx.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-zinc-200 dark:text-zinc-100">{tx.description}</td>
                      <td className={`py-3.5 px-4 font-mono font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                          tx.type === 'income' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">{formatDate(tx.deletedAt)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleRestore('transactions', tx.id)}
                            className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors cursor-pointer"
                            title="Restore Transaction"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteClick('transactions', tx.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Permanently Delete Transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CATEGORIES SECTION ================= */}
        {(activeTab === 'all' || activeTab === 'categories') && catCount > 0 && (
          <div className={cardStyle}>
            <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 ${textMutedStyle}`}>
              <FolderKanban size={14} className="text-zinc-400" />
              Soft Deleted Categories
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${tableBorder} text-zinc-500 font-semibold`}>
                    <th className="pb-3 pr-4">Category Name</th>
                    <th className="pb-3 px-4">Color Anchor</th>
                    <th className="pb-3 px-4">Deletion Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-800/30">
                  {deletedItems.categories.map(c => (
                    <tr key={c.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-zinc-200 dark:text-zinc-100">{c.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: c.color }} />
                          <span className="font-mono text-[10px] text-zinc-400">{c.color}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">{formatDate(c.deletedAt)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleRestore('categories', c.id)}
                            className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors cursor-pointer"
                            title="Restore Category"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteClick('categories', c.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Permanently Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= BUDGETS SECTION ================= */}
        {(activeTab === 'all' || activeTab === 'budgets') && budgetCount > 0 && (
          <div className={cardStyle}>
            <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 ${textMutedStyle}`}>
              <PieChart size={14} className="text-zinc-400" />
              Soft Deleted Budgets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${tableBorder} text-zinc-500 font-semibold`}>
                    <th className="pb-3 pr-4">Budget Month/Year</th>
                    <th className="pb-3 px-4">Allocated Amount</th>
                    <th className="pb-3 px-4">Deletion Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-800/30">
                  {deletedItems.budgets.map(b => (
                    <tr key={b.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-zinc-200 dark:text-zinc-100">
                        {new Date(b.year, b.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono">₹{b.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{formatDate(b.deletedAt)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleRestore('budgets', b.id)}
                            className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors cursor-pointer"
                            title="Restore Budget"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteClick('budgets', b.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Permanently Delete Budget"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= GOALS SECTION ================= */}
        {(activeTab === 'all' || activeTab === 'goals') && goalCount > 0 && (
          <div className={cardStyle}>
            <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 ${textMutedStyle}`}>
              <Target size={14} className="text-zinc-400" />
              Soft Deleted Financial Goals
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${tableBorder} text-zinc-500 font-semibold`}>
                    <th className="pb-3 pr-4">Goal Description</th>
                    <th className="pb-3 px-4">Target Savings</th>
                    <th className="pb-3 px-4">Deletion Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-800/30">
                  {deletedItems.goals.map(g => (
                    <tr key={g.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-zinc-200 dark:text-zinc-100">{g.name}</td>
                      <td className="py-3.5 px-4 font-mono">₹{g.targetAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{formatDate(g.deletedAt)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleRestore('goals', g.id)}
                            className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors cursor-pointer"
                            title="Restore Goal"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteClick('goals', g.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Permanently Delete Goal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Global Empty State */}
        {((activeTab === 'all' && totalCount === 0) ||
          (activeTab === 'transactions' && txCount === 0) ||
          (activeTab === 'wallets' && walletCount === 0) ||
          (activeTab === 'categories' && catCount === 0) ||
          (activeTab === 'budgets' && budgetCount === 0) ||
          (activeTab === 'goals' && goalCount === 0)) && (
            <div className="py-12">
              <EmptyState 
                title="Recycle Bin is empty" 
                description={`No soft-deleted ${activeTab === 'all' ? 'ledgers' : activeTab} were discovered inside your secure sandbox ledger.`} 
              />
            </div>
        )}

      </motion.div>

      {/* Confirmation Modal overlay for Permanent Deletions */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-2xl border p-6 text-center space-y-4 shadow-xl ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                <ShieldAlert size={24} />
              </div>
              <div className="space-y-1">
                <h3 className={`font-bold text-sm ${titleStyle}`}>Purge Record Permanently?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This action is irreversible. The selected {confirmDelete.type.slice(0, -1)} will be permanently deleted from database memory.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="py-2.5 rounded-xl border text-xs font-semibold hover:bg-zinc-150 transition-colors cursor-pointer border-zinc-800 text-zinc-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                >
                  Cancel
                </button>
                <button
                  onClick={executePermanentDelete}
                  className="py-2.5 rounded-xl bg-red-500 text-zinc-950 text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-lg shadow-red-500/10"
                >
                  Confirm Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecycleBinView;
