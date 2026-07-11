import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Landmark, Tag, ChevronDown, Plus, Check, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

interface AddTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

export const AddTxModal: React.FC<AddTxModalProps> = ({ isOpen, onClose, editTx }) => {
  const { 
    wallets, 
    categories, 
    addTransaction, 
    updateTransaction, 
    addCategory, 
    setAddWalletOpen, 
    theme 
  } = useApp();

  const isLight = theme === 'light';

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Inline category creation states
  const [createInlineCategory, setCreateInlineCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatColor, setNewCatColor] = useState<string>('#3b82f6');
  const [newCatIcon, setNewCatIcon] = useState<string>('Tag');

  const miniColors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
  const miniIcons = ['Utensils', 'Home', 'Car', 'ShoppingBag', 'Zap', 'Tag'];

  // Load defaults or edit values
  useEffect(() => {
    if (isOpen) {
      if (editTx) {
        setType(editTx.type);
        setAmount(editTx.amount.toString());
        setWalletId(editTx.walletId);
        setCategoryId(editTx.categoryId);
        setDate(editTx.date);
        setMerchant(editTx.merchant);
        setNote(editTx.note || '');
        setTags(editTx.tags || []);
        setIsRecurring(editTx.isRecurring);
        setRecurringInterval(editTx.recurringInterval || 'monthly');
      } else {
        // Defaults
        setType('expense');
        setAmount('');
        setWalletId(wallets[0]?.id || '');
        
        // Find first category matching default type
        const firstMatchingCat = categories.find(c => c.type === 'expense');
        setCategoryId(firstMatchingCat?.id || '');
        
        setDate(new Date().toISOString().split('T')[0]);
        setMerchant('');
        setNote('');
        setTags([]);
        setIsRecurring(false);
        setRecurringInterval('monthly');
      }
    }
  }, [isOpen, editTx, wallets, categories]);

  // Adjust category selection when type changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const firstMatchingCat = categories.find(c => c.type === newType);
    setCategoryId(firstMatchingCat?.id || '');
    if (!firstMatchingCat) {
      setCreateInlineCategory(true);
    }
  };

  // Auto-select category if none is selected, or if a new one is added
  useEffect(() => {
    if (isOpen) {
      const filtered = categories.filter(c => c.type === type);
      if (filtered.length > 0) {
        if (!filtered.some(c => c.id === categoryId)) {
          setCategoryId(filtered[0].id);
        }
      } else {
        setCategoryId('');
        setCreateInlineCategory(true);
      }
    }
  }, [categories, type, isOpen, categoryId]);

  const handleCreateCategoryInline = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('Please enter a category name');
      return;
    }
    await addCategory({
      name: newCatName.trim(),
      type,
      color: newCatColor,
      icon: newCatIcon
    });
    setNewCatName('');
    setCreateInlineCategory(false);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!walletId) {
      alert('Please select a wallet');
      return;
    }
    if (!categoryId) {
      alert('Please select a category');
      return;
    }
    if (!merchant.trim()) {
      alert('Please enter a merchant / source');
      return;
    }

    const payload = {
      walletId,
      categoryId,
      amount: Number(amount),
      type,
      date,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      tags,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined
    };

    if (editTx) {
      await updateTransaction(editTx.id, payload);
    } else {
      await addTransaction(payload);
    }
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === type);

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
            className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden z-10 border ${
              isLight ? 'bg-white border-zinc-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${
              isLight ? 'border-zinc-100' : 'border-slate-800/60'
            }`}>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>
                <span>{editTx ? 'Edit Transaction' : 'New Transaction'}</span>
                {editTx && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-slate-800 text-emerald-400'
                  }`}>
                    ID: {editTx.id.substring(0, 8)}
                  </span>
                )}
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
            {wallets.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 p-0.5 flex items-center justify-center mx-auto">
                  <Landmark className="text-amber-500 h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    No wallets/accounts created yet
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-slate-400'} leading-relaxed max-w-xs mx-auto`}>
                    You need to create at least one account/wallet before recording transactions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setAddWalletOpen(true);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  + Create First Wallet
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Income / Expense Toggle Card */}
              <div className={`grid grid-cols-2 gap-2.5 p-1 rounded-2xl border ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-slate-950/60 border border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    type === 'expense' 
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm font-bold' 
                      : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  EXPENSE
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    type === 'income' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm font-bold' 
                      : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  INCOME
                </button>
              </div>

              {/* Amount & Merchant Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                    isLight ? 'text-zinc-600' : 'text-slate-400'
                  }`}>Amount</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${
                      isLight ? 'text-zinc-500' : 'text-slate-400'
                    }`}>₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                  }`}>
                    {type === 'expense' ? 'Merchant Name' : 'Income Source'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder={type === 'expense' ? 'e.g. Starbucks' : 'e.g. Monthly Salary'}
                    className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      isLight 
                        ? 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                        : 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50'
                    }`}
                  />
                </div>
              </div>

              {/* Wallet & Category Selection Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                    isLight ? 'text-zinc-600' : 'text-slate-400'
                  }`}>Account / Wallet</label>
                  <div className="relative">
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none appearance-none cursor-pointer border ${
                        isLight 
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                          : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    >
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name} (₹{w.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</option>
                      ))}
                    </select>
                    <Landmark size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isLight ? 'text-zinc-400' : 'text-slate-500'
                    }`} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-zinc-600' : 'text-slate-400'
                    }`}>Category</label>
                    {filteredCategories.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => setCreateInlineCategory(prev => !prev)}
                        className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        {createInlineCategory ? 'Select Existing' : '+ New'}
                      </button>
                    )}
                  </div>

                  {createInlineCategory ? (
                    <div className={`p-3 rounded-xl border space-y-3 ${
                      isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-slate-950 border-slate-850'
                    }`}>
                      <input 
                        type="text"
                        placeholder="Category Name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${
                          isLight 
                            ? 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600'
                        }`}
                      />
                      
                      {/* Color dots */}
                      <div className="space-y-1">
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">Color</span>
                        <div className="flex items-center gap-1.5">
                          {miniColors.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewCatColor(c)}
                              className="h-5 w-5 rounded-full transition-transform cursor-pointer flex items-center justify-center border border-black/15"
                              style={{ backgroundColor: c }}
                            >
                              {newCatColor === c && <Check size={10} className="text-white font-bold" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Icon dots */}
                      <div className="space-y-1">
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">Icon</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {miniIcons.map(ic => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setNewCatIcon(ic)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                                newCatIcon === ic 
                                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500' 
                                  : isLight 
                                  ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700' 
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                              }`}
                            >
                              {ic}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateCategoryInline}
                        className="w-full py-1.5 text-center text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-sm"
                      >
                        Save Category
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={`w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none appearance-none cursor-pointer border ${
                          isLight 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                            : 'bg-slate-950 border-slate-800 text-slate-100'
                        }`}
                      >
                        {filteredCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isLight ? 'text-zinc-400' : 'text-slate-500'
                      }`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Date Pickers */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                  isLight ? 'text-zinc-600' : 'text-slate-400'
                }`}>Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none cursor-pointer border ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                  <Calendar size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isLight ? 'text-zinc-400' : 'text-slate-500'
                  }`} />
                </div>
              </div>

              {/* Note / Description */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                  isLight ? 'text-zinc-600' : 'text-slate-400'
                }`}>Notes (Optional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional context or description..."
                  rows={2}
                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none border ${
                    isLight 
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50'
                  }`}
                />
              </div>

              {/* Tags Field */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                  isLight ? 'text-zinc-600' : 'text-slate-400'
                }`}>Tags</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag and press enter"
                    className={`w-full rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none transition-all border ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50'
                    }`}
                  />
                  <Tag size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isLight ? 'text-zinc-400' : 'text-slate-500'
                  }`} />
                </div>

                {/* Render Tag Badges */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${
                          isLight 
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-700' 
                            : 'bg-slate-850 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>#{tag}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(idx)}
                          className={`focus:outline-none ml-1 ${
                            isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Recurring Transaction Controls */}
              <div className={`p-4 rounded-2xl flex flex-col gap-3 border ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-slate-950/40 border-slate-850'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-slate-200'}`}>Recurring Transaction</span>
                    <span className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-slate-500'}`}>Automatically log this in the future</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <AnimatePresence>
                  {isRecurring && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-3 pt-2 overflow-hidden"
                    >
                      <div>
                        <label className={`block text-[10px] font-semibold mb-1 uppercase tracking-wider ${
                          isLight ? 'text-zinc-500' : 'text-slate-400'
                        }`}>Interval</label>
                        <select
                          value={recurringInterval}
                          onChange={(e: any) => setRecurringInterval(e.target.value)}
                          className={`w-full rounded-lg px-3 py-2 text-xs border focus:outline-none ${
                            isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                          }`}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  {editTx ? 'Save Changes' : 'Create Transaction'}
                </button>
              </div>
            </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTxModal;
