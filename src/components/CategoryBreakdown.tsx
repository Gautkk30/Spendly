import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatIndianNumber } from '../utils/format';
import { CURRENCIES } from '../data/defaultData';
import { PieChart as PieIcon } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Sector 
} from 'recharts';
import DynamicIcon from './Icons';

interface CategoryBreakdownProps {
  categoryChartData: Array<{
    id: string;
    name: string;
    value: number;
    color: string;
  }>;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = React.memo(({ categoryChartData }) => {
  const { 
    categories, 
    currency, 
    theme, 
    activeCategoryFilter, 
    setActiveCategoryFilter,
    transactions,
    wallets
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';
  const cardStyle = isLight 
    ? 'bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-full' 
    : 'bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-full';
  
  const titleStyle = isLight ? 'text-zinc-950' : 'text-zinc-50';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  // Active shape rendering for selected state
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g style={{ outline: 'none' }}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8} // Slightly enlarge the slice
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ 
            filter: 'brightness(1.15) drop-shadow(0 6px 14px rgba(0,0,0,0.22))', // Brighten slightly
            transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer',
            outline: 'none'
          }}
        />
      </g>
    );
  };

  // Handle outside click, escape key, and window resize to dismiss
  useEffect(() => {
    const dismissAll = () => {
      setActiveCategoryFilter(null);
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        dismissAll();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissAll();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', dismissAll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', dismissAll);
    };
  }, [setActiveCategoryFilter]);

  // Handle click on slice
  const handleSliceClick = (data: any, index: number, event: any) => {
    if (event) {
      event.stopPropagation();
    }

    const entry = categoryChartData[index];
    if (!entry) return;

    if (activeCategoryFilter === entry.id) {
      // Toggle off if clicking the same active slice
      setActiveCategoryFilter(null);
    } else {
      // Set the active filter globally
      setActiveCategoryFilter(entry.id);
    }
  };

  const selectedIndex = activeCategoryFilter !== null 
    ? categoryChartData.findIndex(c => c.id === activeCategoryFilter) 
    : -1;

  // Let's compute selected category analytics
  const analytics = React.useMemo(() => {
    if (activeCategoryFilter === null) return null;

    const entry = categoryChartData[selectedIndex];
    if (!entry) return null;

    const cat = categories.find(c => c.id === activeCategoryFilter);
    const matchingTx = transactions.filter(t => t.type === 'expense' && t.categoryId === activeCategoryFilter);

    // Rate conversions
    const getConvertedAmount = (tx: typeof transactions[0]) => {
      const wallet = wallets.find(w => w.id === tx.walletId);
      const rateToUSD = CURRENCIES[wallet?.currency || 'USD']?.rate || 1.0;
      const amountInUSD = tx.amount / rateToUSD;
      const displayRate = CURRENCIES[currency]?.rate || 1.0;
      return amountInUSD * displayRate;
    };

    const totalSpending = categoryChartData.reduce((sum, c) => sum + c.value, 0);
    const percentage = totalSpending > 0 ? Math.round((entry.value / totalSpending) * 100) : 0;

    let totalAmount = 0;
    let maxAmt = -1;
    let minAmt = Infinity;
    let largestTx: typeof transactions[0] | null = null;
    let smallestTx: typeof transactions[0] | null = null;

    matchingTx.forEach(tx => {
      const amt = getConvertedAmount(tx);
      totalAmount += amt;

      if (amt > maxAmt) {
        maxAmt = amt;
        largestTx = tx;
      }
      if (amt < minAmt) {
        minAmt = amt;
        smallestTx = tx;
      }
    });

    const count = matchingTx.length;
    const average = count > 0 ? totalAmount / count : 0;

    return {
      name: entry.name,
      color: entry.color,
      icon: cat?.icon || 'HelpCircle',
      total: entry.value, // Keep consistent with chart value
      percentage,
      count,
      average,
      largest: largestTx ? { amount: maxAmt, merchant: largestTx.merchant } : null,
      smallest: smallestTx ? { amount: minAmt, merchant: smallestTx.merchant } : null
    };
  }, [activeCategoryFilter, selectedIndex, categoryChartData, categories, transactions, wallets, currency]);

  return (
    <div id="category-breakdown-card" className={cardStyle} ref={containerRef}>
      <div className="space-y-0.5 mb-6">
        <h3 className={`font-bold text-sm ${titleStyle}`}>Category Breakdown</h3>
        <p className={`text-[10px] ${textMutedStyle}`}>Distribution of cumulative expense allocations</p>
      </div>

      {/* Active Category Filter Indicator */}
      {activeCategoryFilter && (
        <div id="category-filter-banner" className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-3 py-1.5 text-[10px] font-semibold animate-fade-in mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[150px]">Filtered: {categories.find(c => c.id === activeCategoryFilter)?.name || 'Category'}</span>
          </div>
          <button 
            id="clear-category-filter-btn"
            onClick={(e) => { 
              e.stopPropagation(); 
              setActiveCategoryFilter(null); 
            }}
            className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-300 font-bold px-1 cursor-pointer transition-colors text-[10px]"
          >
            Clear Filter
          </button>
        </div>
      )}

      {categoryChartData.length === 0 ? (
        <div id="category-empty-state" className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-500/70 dark:text-zinc-400/60">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/30 flex items-center justify-center mb-3">
            <PieIcon size={18} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <span className="text-xs font-semibold tracking-tight">No spending data available</span>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed max-w-[180px]">Logged expenses will populate this visual distribution</p>
        </div>
      ) : (
        <div 
          id="category-breakdown-chart-container" 
          className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1"
        >
          {/* Left Column: Donut Chart */}
          <div 
            className="xl:col-span-5 h-44 flex justify-center cursor-pointer relative items-center"
            onClick={() => {
              if (activeCategoryFilter) {
                setActiveCategoryFilter(null);
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  paddingAngle={2.5}
                  dataKey="value"
                  activeIndex={selectedIndex}
                  activeShape={renderActiveShape}
                  onClick={(data, index, event) => handleSliceClick(data, index, event)}
                  style={{ outline: 'none' }}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ 
                        outline: 'none', 
                        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: selectedIndex === index ? 'brightness(1.15)' : 'none'
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right Column: Analytics Panel */}
          <div className="xl:col-span-7 flex flex-col justify-center min-h-[220px]">
            {analytics ? (
              <div className="space-y-3.5 animate-fade-in text-left">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <div 
                    className="h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
                    style={{ 
                      backgroundColor: `${analytics.color}15`, 
                      borderColor: `${analytics.color}35`,
                      color: analytics.color
                    }}
                  >
                    <DynamicIcon name={analytics.icon} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold truncate max-w-[120px] ${titleStyle}`}>{analytics.name}</h4>
                      <span 
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ 
                          backgroundColor: `${analytics.color}18`, 
                          color: analytics.color 
                        }}
                      >
                        {analytics.percentage}%
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-400 font-semibold">Active filter applied</p>
                  </div>
                </div>

                {/* Main Total Value Card */}
                <div className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-zinc-50 border-zinc-150' : 'bg-zinc-900/30 border-zinc-800'
                }`}>
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Total Outflow</span>
                  <div className="text-base font-extrabold font-mono text-red-500 mt-0.5">
                    {formatIndianNumber(analytics.total, currency)}
                  </div>
                </div>

                {/* Grid of Transaction Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isLight ? 'bg-zinc-50/50 border-zinc-100' : 'bg-zinc-900/10 border-zinc-850'
                  }`}>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Transactions</span>
                    <span className={`text-xs font-extrabold font-mono mt-0.5 ${titleStyle}`}>{analytics.count} txs</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isLight ? 'bg-zinc-50/50 border-zinc-100' : 'bg-zinc-900/10 border-zinc-850'
                  }`}>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Avg Amount</span>
                    <span className={`text-xs font-extrabold font-mono mt-0.5 ${titleStyle}`}>
                      {formatIndianNumber(Math.round(analytics.average), currency)}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border flex flex-col col-span-2 ${
                    isLight ? 'bg-zinc-50/50 border-zinc-100' : 'bg-zinc-900/10 border-zinc-850'
                  }`}>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Largest Tx</span>
                    {analytics.largest ? (
                      <div className="flex justify-between items-center mt-0.5 min-w-0">
                        <span className={`text-[10px] font-bold truncate max-w-[120px] ${titleStyle}`}>
                          {analytics.largest.merchant}
                        </span>
                        <span className="text-xs font-extrabold font-mono text-red-500 shrink-0 ml-2">
                          {formatIndianNumber(Math.round(analytics.largest.amount), currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">—</span>
                    )}
                  </div>
                  <div className={`p-2.5 rounded-xl border flex flex-col col-span-2 ${
                    isLight ? 'bg-zinc-50/50 border-zinc-100' : 'bg-zinc-900/10 border-zinc-850'
                  }`}>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Smallest Tx</span>
                    {analytics.smallest ? (
                      <div className="flex justify-between items-center mt-0.5 min-w-0">
                        <span className={`text-[10px] font-bold truncate max-w-[120px] ${titleStyle}`}>
                          {analytics.smallest.merchant}
                        </span>
                        <span className="text-xs font-extrabold font-mono text-red-500 shrink-0 ml-2">
                          {formatIndianNumber(Math.round(analytics.smallest.amount), currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">—</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-2xl min-h-[220px] ${
                isLight ? 'bg-zinc-50/20 border-zinc-200 text-zinc-400' : 'bg-zinc-950/20 border-zinc-850 text-zinc-500'
              }`}>
                <PieIcon size={24} className="mb-2 text-zinc-300 dark:text-zinc-650" />
                <span className={`text-xs font-bold ${titleStyle}`}>Select a category</span>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-[180px] leading-relaxed">
                  Click any slice on the chart to filter list & explore cumulative insights.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
