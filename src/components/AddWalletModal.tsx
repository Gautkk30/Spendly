import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Landmark, CreditCard, Coins, PiggyBank, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENCIES } from '../data/defaultData';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose }) => {
  const { addWallet, theme } = useApp();

  const isLight = theme === 'light';

  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'cash' | 'card' | 'savings'>('bank');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('bank');
      setBalance('');
      setCurrency('INR');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a wallet/account name');
      return;
    }
    const initialBalance = balance === '' ? 0 : Number(balance);
    if (isNaN(initialBalance)) {
      alert('Please enter a valid initial balance');
      return;
    }

    await addWallet({
      name: name.trim(),
      balance: initialBalance,
      type,
      currency
    });

    onClose();
  };

  const types = [
    { id: 'bank', name: 'Bank Account', icon: Landmark, desc: 'Checking or Salary', color: 'text-blue-500' },
    { id: 'cash', name: 'Cash', icon: Coins, desc: 'Physical cash or wallet', color: 'text-amber-500' },
    { id: 'card', name: 'Credit Card', icon: CreditCard, desc: 'Credit card limits', color: 'text-rose-500' },
    { id: 'savings', name: 'Savings Pot', icon: PiggyBank, desc: 'Savings and investments', color: 'text-emerald-500' }
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 border ${
              isLight ? 'bg-white border-zinc-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${
              isLight ? 'border-zinc-100' : 'border-slate-800/60'
            }`}>
              <h2 className={`text-lg font-bold ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>
                New Account
              </h2>
              <button 
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight 
                    ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Wallet Name */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                  isLight ? 'text-zinc-600' : 'text-slate-400'
                }`}>Account Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HDFC Checking, Cash, SBI Savings"
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                      : 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50'
                  }`}
                />
              </div>

              {/* Type Selection Grid */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  isLight ? 'text-zinc-600' : 'text-slate-400'
                }`}>Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {types.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'bg-zinc-100 border-zinc-400 ring-2 ring-zinc-400/10'
                              : 'bg-slate-850 border-emerald-500/30 ring-2 ring-emerald-500/10'
                            : isLight
                            ? 'bg-white border-zinc-200 hover:border-zinc-300'
                            : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Icon size={14} className={t.color} />
                          <span className={isLight ? 'text-zinc-900' : 'text-white'}>{t.name}</span>
                        </div>
                        <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-slate-500'}`}>{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Balance & Currency Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                    isLight ? 'text-zinc-600' : 'text-slate-400'
                  }`}>Initial Balance</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${
                      isLight ? 'text-zinc-500' : 'text-slate-400'
                    }`}>{CURRENCIES[currency]?.symbol || '₹'}</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className={`w-full rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none transition-all font-mono ${
                        isLight 
                          ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                          : 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                    isLight ? 'text-zinc-600' : 'text-slate-400'
                  }`}>Currency</label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none appearance-none cursor-pointer border ${
                        isLight 
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                          : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    >
                      {Object.keys(CURRENCIES).map((c) => (
                        <option key={c} value={c}>
                          {c} ({CURRENCIES[c].symbol})
                        </option>
                      ))}
                    </select>
                    <Globe size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isLight ? 'text-zinc-400' : 'text-slate-500'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    isLight 
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800/80'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddWalletModal;
