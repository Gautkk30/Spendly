import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Landmark, 
  CreditCard, 
  Coins, 
  PiggyBank, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  Calendar,
  Layers,
  DollarSign,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENCIES } from '../data/defaultData';
import { Wallet, WalletType, CurrencyCode } from '../types';
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

const WALLET_TYPES = [
  { id: 'bank' as WalletType, name: 'Bank Account', icon: Landmark, desc: 'Checking or Salary', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'cash' as WalletType, name: 'Cash', icon: Coins, desc: 'Physical cash or wallet', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'card' as WalletType, name: 'Credit Card', icon: CreditCard, desc: 'Credit limit accounts', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'savings' as WalletType, name: 'Savings Pot', icon: PiggyBank, desc: 'Investments and savings', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
];

export const WalletsView: React.FC = () => {
  const { wallets, transactions, addWallet, updateWallet, deleteWallet, theme, isLoading } = useApp();

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
        <SkeletonLoader variant="card" count={3} className="grid grid-cols-1 md:grid-cols-3 gap-5" />
      </div>
    );
  }

  // Form / Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  
  // Local Form Fields State
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Safety Delete State
  const [deleteSafetyTarget, setDeleteSafetyTarget] = useState<Wallet | null>(null);

  // Suggested names for quick onboarding selection
  const suggestions = [
    'Cash', 'SBI', 'HDFC', 'ICICI', 'Federal', 'Axis', 'UPI', 'Credit Card', 'Business', 'Savings'
  ];

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setName('');
    setType('bank');
    setBalance('');
    setCurrency('INR');
    setModalOpen(true);
  };

  const handleOpenEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setName(wallet.name);
    setType(wallet.type);
    setBalance(wallet.balance.toString());
    setCurrency(wallet.currency);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Wallet name is required');
      return;
    }

    const numBalance = balance === '' ? 0 : Number(balance);
    if (isNaN(numBalance)) {
      alert('Please enter a valid balance');
      return;
    }

    if (editingWallet) {
      await updateWallet(editingWallet.id, {
        name: name.trim(),
        balance: numBalance,
        type,
        currency
      });
    } else {
      await addWallet({
        name: name.trim(),
        balance: numBalance,
        type,
        currency
      });
    }

    setModalOpen(false);
  };

  const handleDeleteTrigger = (wallet: Wallet) => {
    setDeleteSafetyTarget(wallet);
  };

  const handleDeleteConfirm = async () => {
    if (deleteSafetyTarget) {
      await deleteWallet(deleteSafetyTarget.id);
      setDeleteSafetyTarget(null);
    }
  };

  // Helper to format currency values
  const formatBalance = (amount: number, currencyCode: CurrencyCode) => {
    const symbol = CURRENCIES[currencyCode]?.symbol || currencyCode;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate stats for a given wallet
  const getWalletStats = (walletId: string) => {
    const walletTxs = transactions.filter(t => t.walletId === walletId && !t.isDeleted);
    return {
      txCount: walletTxs.length
    };
  };

  const cardStyle = isLight 
    ? 'p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between' 
    : 'p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 shadow-xl hover:border-zinc-700/60 transition-all relative overflow-hidden flex flex-col justify-between';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const modalBg = isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800';

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Title Header Row */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold tracking-tight ${titleStyle}`}>Accounts</h1>
          <p className={`text-xs ${textMutedStyle}`}>Create and manage your liquid funds, cards, and bank ledgers</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>Create Account</span>
        </button>
      </motion.div>

      {/* Main List Grid */}
      {wallets.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className={`p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-5 max-w-lg mx-auto mt-12 ${
            isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-900/20 border-zinc-800'
          }`}
        >
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Landmark size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className={`font-bold text-base ${titleStyle}`}>No accounts created yet</h3>
            <p className={`text-xs ${textMutedStyle} leading-relaxed max-w-xs mx-auto`}>
              Every personal financial statement requires at least one asset account. Add your first bank, credit card, or cash account to begin tracking.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
          >
            + Create First Account
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {wallets.map((wallet) => {
            const typeConfig = WALLET_TYPES.find(t => t.id === wallet.type) || WALLET_TYPES[0];
            const IconComponent = typeConfig.icon;
            const stats = getWalletStats(wallet.id);
            const createdDateStr = wallet.createdAt 
              ? new Date(wallet.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'Unknown';

            return (
              <motion.div 
                key={wallet.id}
                variants={itemVariants}
                className={cardStyle}
              >
                {/* Visual Accent Corner Glow */}
                <div className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-3xl pointer-events-none ${
                  wallet.type === 'bank' ? 'bg-blue-500/5' :
                  wallet.type === 'card' ? 'bg-rose-500/5' :
                  wallet.type === 'savings' ? 'bg-emerald-500/5' : 'bg-amber-500/5'
                }`} />

                {/* Card Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-2xl shrink-0 ${typeConfig.bg} ${typeConfig.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm tracking-tight ${titleStyle}`}>{wallet.name}</h3>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${textMutedStyle}`}>
                        {typeConfig.name}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown Button Bar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(wallet)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800' : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200'
                      }`}
                      title="Edit Account"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteTrigger(wallet)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-red-50 text-red-400 hover:text-red-600' : 'hover:bg-red-950/30 text-red-400/80 hover:text-red-400'
                      }`}
                      title="Delete Account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Body Balance */}
                <div className="my-3 relative z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${textMutedStyle}`}>Current Balance</span>
                  <div className={`text-xl font-black ${
                    wallet.balance < 0 ? 'text-red-500' : isLight ? 'text-zinc-900' : 'text-zinc-50'
                  }`}>
                    {formatBalance(wallet.balance, wallet.currency)}
                  </div>
                </div>

                {/* Card Footer Details */}
                <div className={`border-t pt-3 mt-4 flex items-center justify-between text-[10px] ${
                  isLight ? 'border-zinc-100 text-zinc-400' : 'border-zinc-800/60 text-zinc-500'
                } relative z-10`}>
                  <div className="flex items-center gap-1">
                    <Layers size={10} />
                    <span>{stats.txCount} {stats.txCount === 1 ? 'transaction' : 'transactions'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>Created {createdDateStr}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* CREATE & EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden z-10 ${modalBg}`}
            >
              {/* Header */}
              <div className={`px-6 py-5 border-b flex items-center justify-between ${
                isLight ? 'border-zinc-100' : 'border-zinc-800/60'
              }`}>
                <h2 className={`text-base font-bold ${titleStyle}`}>
                  {editingWallet ? 'Edit Account' : 'New Account'}
                </h2>
                <button 
                  onClick={() => setModalOpen(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight 
                      ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100' 
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                
                {/* Wallet Name Input */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>
                    Account Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SBI Checking, Axis Credit Card, HDFC Savings"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all ${
                      isLight 
                        ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-950/60'
                    }`}
                  />
                  
                  {/* Onboarding Suggestion Badges */}
                  {!editingWallet && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setName(sug)}
                          className={`px-2 py-0.5 text-[9px] rounded-md border font-semibold transition-colors cursor-pointer ${
                            name === sug 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                              : isLight ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-400'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Type Selection (Maps to Icon) */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedStyle}`}>
                    Wallet Type & Icon
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {WALLET_TYPES.map((t) => {
                      const TypeIcon = t.icon;
                      const isSelected = type === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-zinc-100 border-zinc-400 ring-2 ring-zinc-400/5'
                                : 'bg-zinc-850 border-emerald-500/45 ring-2 ring-emerald-500/5'
                              : isLight
                              ? 'bg-white border-zinc-200 hover:border-zinc-350'
                              : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <TypeIcon size={14} className={t.color} />
                            <span className={isLight ? 'text-zinc-800' : 'text-white'}>{t.name}</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 leading-normal">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Currency Selection */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>
                    Accounting Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-50 border border-zinc-200 text-zinc-700 focus:border-zinc-400 focus:bg-white' 
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-emerald-500/50'
                    }`}
                  >
                    {Object.keys(CURRENCIES).map((code) => (
                      <option key={code} value={code}>
                        {code} ({CURRENCIES[code].symbol}) - {CURRENCIES[code].name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Initial Balance */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>
                    {editingWallet ? 'Account Balance' : 'Initial Starting Balance'}
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${textMutedStyle}`}>
                      {CURRENCIES[currency]?.symbol || currency}
                    </div>
                    <input 
                      type="number" 
                      step="any"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className={`w-full rounded-xl pl-8 pr-4 py-2.5 text-xs focus:outline-none transition-all ${
                        isLight 
                          ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Submit button bar */}
                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600' 
                        : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md cursor-pointer"
                  >
                    {editingWallet ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAFETY DELETE WARNING DIALOG */}
      <AnimatePresence>
        {deleteSafetyTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteSafetyTarget(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-sm rounded-3xl border shadow-2xl p-6 space-y-4 z-10 ${modalBg}`}
            >
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                <AlertTriangle size={24} />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className={`font-bold text-sm ${titleStyle}`}>
                  {getWalletStats(deleteSafetyTarget.id).txCount > 0 
                    ? `Deletion Blocked` 
                    : `Delete Account "${deleteSafetyTarget.name}"?`}
                </h3>
                {getWalletStats(deleteSafetyTarget.id).txCount > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      This account contains <span className="font-bold text-red-500">{getWalletStats(deleteSafetyTarget.id).txCount} active transactions</span>. Deletion is blocked to prevent orphaned financial records.
                    </p>
                    <div className="px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] text-red-400 leading-normal font-medium">
                      ⚠️ Please delete or reassign all transactions belonging to this account first before attempting to delete it.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Are you sure you want to permanently delete this account? This action can be undone from the Recycle Bin.
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                {getWalletStats(deleteSafetyTarget.id).txCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setDeleteSafetyTarget(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Okay, Got It
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDeleteSafetyTarget(null)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        isLight 
                          ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600' 
                          : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
                    >
                      Yes, Delete Account
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default WalletsView;
