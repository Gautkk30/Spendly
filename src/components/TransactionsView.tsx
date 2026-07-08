import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatIndianNumber } from '../utils/format';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Copy, 
  Edit2, 
  Check, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FolderMinus,
  Download
} from 'lucide-react';
import DynamicIcon from './Icons';

interface TransactionsViewProps {
  onOpenAddTx: () => void;
  onEditTx: (tx: any) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddTx, onEditTx }) => {
  const { 
    transactions, 
    categories, 
    wallets, 
    deleteTransaction, 
    bulkDeleteTransactions, 
    addTransaction,
    theme,
    globalSearch,
    setGlobalSearch
  } = useApp();

  const search = globalSearch;
  const setSearch = setGlobalSearch;
  
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isLight = theme === 'light';

  // ------------------------------------------
  // FILTERING LOGIC
  // ------------------------------------------
  const filtered = transactions.filter(tx => {
    // Search filter
    const cat = categories.find(c => c.id === tx.categoryId);
    const catName = cat ? cat.name : '';
    const matchesSearch = tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
                          (tx.note && tx.note.toLowerCase().includes(search.toLowerCase())) ||
                          tx.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
                          catName.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || tx.categoryId === filterCategory;

    // Wallet filter
    const matchesWallet = filterWallet === 'all' || tx.walletId === filterWallet;

    // Type filter
    const matchesType = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesCategory && matchesWallet && matchesType;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      await bulkDeleteTransactions(selectedIds);
      setSelectedIds([]);
    }
  };

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

  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Type', 'Category', 'Wallet', 'Amount', 'Tags', 'Notes'];
    const rows = filtered.map(t => {
      const catName = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      const wName = wallets.find(w => w.id === t.walletId)?.name || 'Unknown';
      return [
        t.date,
        `"${t.merchant.replace(/"/g, '""')}"`,
        t.type.toUpperCase(),
        catName,
        wName,
        t.amount,
        `"${t.tags.join(', ')}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "spendly_ledger_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const panelStyle = isLight 
    ? 'p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm transition-all' 
    : 'p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 transition-all';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold tracking-tight ${titleStyle}`}>Ledger Auditing</h1>
          <p className={`text-xs ${textMutedStyle}`}>Search, filter, bulk-update or export transaction line-items</p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button 
            onClick={handleExportCSV}
            className={`px-3.5 py-1.5 text-xs font-semibold border rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border-zinc-800'
            }`}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={onOpenAddTx}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
            }`}
          >
            Create Entry
          </button>
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 ${panelStyle}`}>
        {/* Search */}
        <div className="relative">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant, tag, note..."
            className={`w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all ${
              isLight 
                ? 'bg-zinc-50 hover:bg-zinc-100 focus:bg-zinc-100 text-zinc-950 placeholder-zinc-400 border-zinc-200' 
                : 'bg-zinc-950 hover:bg-zinc-900 focus:bg-zinc-900 text-zinc-100 placeholder-zinc-500 border-zinc-850'
            }`}
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`border text-xs font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none ${
            isLight 
              ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700' 
              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
          }`}
        >
          <option value="all">All Types</option>
          <option value="expense">Expense Only</option>
          <option value="income">Income Only</option>
        </select>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`border text-xs font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none ${
            isLight 
              ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700' 
              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
          }`}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.type.toUpperCase()}: {c.name}</option>
          ))}
        </select>

        {/* Wallet filter */}
        <select
          value={filterWallet}
          onChange={(e) => setFilterWallet(e.target.value)}
          className={`border text-xs font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none ${
            isLight 
              ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700' 
              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-300'
          }`}
        >
          <option value="all">All Accounts</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Main Ledger Table */}
      {/* Main Ledger container */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${
        isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800/60'
      }`}>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${
                isLight ? 'border-zinc-100 text-zinc-400 bg-zinc-50/50' : 'border-zinc-800/60 text-zinc-500 bg-zinc-950/20'
              }`}>
                <th className="py-3.5 px-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    className="accent-zinc-900 dark:accent-zinc-100 rounded cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">Merchant / Date</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Account</th>
                <th className="py-3.5 px-3">Tags</th>
                <th className="py-3.5 px-3 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-zinc-100' : 'divide-zinc-800/40'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <FolderMinus size={32} className="mx-auto text-zinc-400 mb-3" />
                    <p className="text-xs font-bold">No transactions found</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Try relaxing filters or create a new transaction entry</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const wall = wallets.find(w => w.id === tx.walletId);
                  const isExpense = tx.type === 'expense';
                  const isSelected = selectedIds.includes(tx.id);
                  
                  return (
                    <tr 
                      key={tx.id} 
                      className={`group hover:bg-zinc-500/[0.015] transition-colors ${
                        isSelected 
                          ? isLight ? 'bg-zinc-50' : 'bg-zinc-900/40' 
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(tx.id, e.target.checked)}
                          className="accent-zinc-900 dark:accent-zinc-100 rounded cursor-pointer"
                        />
                      </td>

                      {/* Merchant & Date */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                          }`}>
                            <DynamicIcon name={cat?.icon || 'HelpCircle'} className={isLight ? 'text-zinc-600' : 'text-zinc-400'} size={14} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-xs font-bold truncate ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{tx.merchant}</span>
                              {tx.isRecurring && (
                                <span className={`text-[9px] font-bold px-1 rounded lowercase shrink-0 ${
                                  isLight ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                }`}>
                                  {tx.recurringInterval}
                                </span>
                              )}
                              {tx.ocrExtracted && (
                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded lowercase shrink-0" title="Scanned via AI OCR">
                                  ocr
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-0.5">{new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                          style={{ backgroundColor: `${cat?.color}12`, color: cat?.color }}
                        >
                          {cat?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Wallet Card */}
                      <td className="py-3.5 px-3">
                        <span className={`text-xs font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{wall?.name || 'External'}</span>
                      </td>

                      {/* Tags List */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {tx.tags.length === 0 ? (
                            <span className="text-zinc-400 text-[10px] font-semibold">-</span>
                          ) : (
                            tx.tags.map((tag, idx) => (
                              <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isLight ? 'text-zinc-500 bg-zinc-100' : 'text-zinc-400 bg-zinc-900 border border-zinc-850'
                              }`}>
                                #{tag}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 px-3 text-right font-bold font-mono text-xs ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isExpense ? '-' : '+'}{formatIndianNumber(tx.amount, 'INR').replace(/^-/, '')}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDuplicate(tx)}
                            className={`p-1 rounded border cursor-pointer ${
                              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                            title="Duplicate"
                          >
                            <Copy size={10} />
                          </button>
                          <button 
                            onClick={() => onEditTx(tx)}
                            className={`p-1 rounded border cursor-pointer ${
                              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                            title="Edit"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(tx.id)}
                            className={`p-1 rounded border cursor-pointer ${
                              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-950/50 hover:text-red-400'
                            }`}
                            title="Delete"
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

        {/* Mobile Touch-Friendly Card List View */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 px-4">
              <FolderMinus size={32} className="mx-auto text-zinc-400 mb-3" />
              <p className="text-xs font-bold">No transactions found</p>
              <p className="text-[10px] text-zinc-400 mt-1">Try relaxing filters or create a new transaction entry</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const wall = wallets.find(w => w.id === tx.walletId);
              const isExpense = tx.type === 'expense';
              const isSelected = selectedIds.includes(tx.id);

              return (
                <div 
                  key={tx.id} 
                  className={`p-4 flex flex-col gap-3 transition-colors ${
                    isSelected 
                      ? isLight ? 'bg-zinc-50/75' : 'bg-zinc-900/40' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(tx.id, e.target.checked)}
                        className="accent-zinc-900 dark:accent-zinc-100 rounded cursor-pointer shrink-0"
                      />
                      
                      <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                      }`}>
                        <DynamicIcon name={cat?.icon || 'HelpCircle'} className={isLight ? 'text-zinc-600' : 'text-zinc-400'} size={14} />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className={`text-xs font-bold truncate ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{tx.merchant}</span>
                          {tx.isRecurring && (
                            <span className="text-[8px] font-black uppercase px-1 rounded bg-zinc-800 text-zinc-300">
                              {tx.recurringInterval}
                            </span>
                          )}
                          {tx.ocrExtracted && (
                            <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                              ocr
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-xs font-black font-mono ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isExpense ? '-' : '+'}{formatIndianNumber(tx.amount, 'INR').replace(/^-/, '')}
                      </span>
                      <span className={`text-[9px] font-bold mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {wall?.name || 'Cash'}
                      </span>
                    </div>
                  </div>

                  {/* Tags list on mobile */}
                  {tx.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-16">
                      {tx.tags.map((tag, idx) => (
                        <span key={idx} className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isLight ? 'text-zinc-500 bg-zinc-100' : 'text-zinc-400 bg-zinc-900 border border-zinc-850'
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pl-16 pt-1 border-t border-dashed border-zinc-100 dark:border-zinc-800/40 mt-1">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: `${cat?.color}12`, color: cat?.color }}
                    >
                      {cat?.name || 'Uncategorized'}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleDuplicate(tx)}
                        className={`p-1.5 rounded border cursor-pointer ${
                          isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Duplicate"
                      >
                        <Copy size={11} />
                      </button>
                      <button 
                        onClick={() => onEditTx(tx)}
                        className={`p-1.5 rounded border cursor-pointer ${
                          isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Edit"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className={`p-1.5 rounded border cursor-pointer text-red-500 ${
                          isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-red-50 hover:border-red-200' : 'bg-zinc-950 border-zinc-800 hover:border-red-950/50'
                        }`}
                        title="Delete"
                      >
                        <Trash2 size={11} />
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
  );
};

export default TransactionsView;
