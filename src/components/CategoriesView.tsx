import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderPlus, Trash2, Tag, Palette } from 'lucide-react';
import DynamicIcon from './Icons';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, deleteCategory, theme } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#ef4444');
  const [icon, setIcon] = useState('Utensils');

  const isLight = theme === 'light';

  const iconsList = [
    'Utensils', 'Home', 'Car', 'ShoppingBag', 'Zap', 'Film', 'HeartPulse', 'Plane',
    'Laptop', 'Briefcase', 'TrendingUp', 'Gift', 'HelpCircle', 'Wallet', 'BookOpen',
    'Coffee', 'Music', 'Sparkles', 'Shield', 'Trophy', 'User'
  ];

  const colorsList = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#14b8a6', '#06b6d4', '#6b7280', '#0f172a', '#e11d48', '#2563eb', '#16a34a'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please fill out the category name');
      return;
    }

    await addCategory({
      name: name.trim(),
      type,
      color,
      icon
    });

    setName('');
  };

  const cardStyle = isLight 
    ? 'p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm transition-all' 
    : 'p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 transition-all';

  const inputStyle = isLight 
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400' 
    : 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className={`text-2xl font-bold tracking-tight ${titleStyle}`}>Category Registrations</h1>
        <p className={`text-xs ${textMutedStyle}`}>Establish and coordinate visual themes, colors, and classifications for your logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create custom category */}
        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-6">
            <FolderPlus size={16} className={isLight ? 'text-zinc-700' : 'text-zinc-300'} />
            <h3 className={`font-bold text-sm ${titleStyle}`}>Create Custom</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Category Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subscriptions"
                className={inputStyle}
              />
            </div>

            {/* Income / Expense toggle */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Ledger Allocation Type</label>
              <div className={`grid grid-cols-2 gap-1.5 p-1 border rounded-xl ${
                isLight ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
              }`}>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'expense' 
                      ? isLight 
                        ? 'bg-white text-red-600 shadow-sm border border-red-100' 
                        : 'bg-zinc-850 text-red-400' 
                      : 'text-zinc-400 hover:text-zinc-500'
                  }`}
                >
                  EXPENSE
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'income' 
                      ? isLight 
                        ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' 
                        : 'bg-zinc-850 text-emerald-400' 
                      : 'text-zinc-400 hover:text-zinc-500'
                  }`}
                >
                  INCOME
                </button>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${textMutedStyle}`}>
                <Tag size={10} /> Pick Icon
              </label>
              <div className={`grid grid-cols-7 gap-1.5 p-2 border rounded-xl max-h-32 overflow-y-auto ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
              }`}>
                {iconsList.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                      icon === ic 
                        ? isLight 
                          ? 'bg-zinc-900 border-zinc-900 text-white' 
                          : 'bg-zinc-800 border-zinc-700 text-white' 
                        : isLight 
                          ? 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900' 
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-zinc-200'
                    }`}
                    title={ic}
                  >
                    <DynamicIcon name={ic} size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${textMutedStyle}`}>
                <Palette size={10} /> Brand Color
              </label>
              <div className={`flex flex-wrap gap-2 p-2 border rounded-xl ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
              }`}>
                {colorsList.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`h-5 w-5 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0`}
                    style={{ 
                      backgroundColor: col, 
                      borderColor: color === col ? (isLight ? '#000000' : '#ffffff') : 'transparent',
                      transform: color === col ? 'scale(1.15)' : 'none'
                    }}
                  />
                ))}
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
              Add Category
            </button>
          </form>
        </div>

        {/* Right Column: Existing Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`text-xs font-semibold uppercase tracking-wider ${textMutedStyle}`}>Indexed Classifications</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm ${
                  isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center shrink-0 border ${
                      isLight ? 'border-zinc-100' : 'border-zinc-800/80'
                    }`}
                    style={{ backgroundColor: `${cat.color}12`, color: cat.color }}
                  >
                    <DynamicIcon name={cat.icon} size={14} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold truncate ${titleStyle}`}>{cat.name}</span>
                    <span className={`text-[9px] uppercase mt-0.5 tracking-wider font-bold ${textMutedStyle}`}>{cat.type}</span>
                  </div>
                </div>

                {cat.isCustom && (
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-red-500' 
                        : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-red-400'
                    }`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoriesView;
