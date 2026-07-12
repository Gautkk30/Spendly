import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatIndianNumber } from '../utils/format';
import { PieChart as PieIcon } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Sector,
  Tooltip
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
    setActiveView 
  } = useApp();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';
  const cardStyle = isLight 
    ? 'bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-full' 
    : 'bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-full';
  
  const titleStyle = isLight ? 'text-zinc-950' : 'text-zinc-50';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  // Active shape rendering for hover state
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g style={{ outline: 'none' }}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ 
            filter: 'brightness(1.12) drop-shadow(0 6px 16px rgba(0,0,0,0.22))',
            transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer',
            outline: 'none'
          }}
        />
      </g>
    );
  };

  // Tooltip tracking and dismissal listeners
  useEffect(() => {
    const dismissTooltip = () => {
      setHoveredIndex(null);
    };

    // Dismiss conditions
    window.addEventListener('scroll', dismissTooltip, { passive: true });
    window.addEventListener('resize', dismissTooltip);
    document.addEventListener('visibilitychange', dismissTooltip);
    document.addEventListener('mouseleave', dismissTooltip);

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        dismissTooltip();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });

    return () => {
      window.removeEventListener('scroll', dismissTooltip);
      window.removeEventListener('resize', dismissTooltip);
      document.removeEventListener('visibilitychange', dismissTooltip);
      document.removeEventListener('mouseleave', dismissTooltip);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Custom native tooltip content renderer
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const entry = payload[0].payload;
    const totalSpending = categoryChartData.reduce((sum, c) => sum + c.value, 0);
    const percentage = totalSpending > 0 ? Math.round((entry.value / totalSpending) * 100) : 0;
    const cat = categories.find(c => c.id === entry.id);

    return (
      <div 
        className={`rounded-2xl border p-3.5 flex flex-col gap-1.5 text-left transition-all ${
          isLight 
            ? 'bg-white border-zinc-100 text-zinc-900 shadow-xl' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl'
        }`}
        style={{
          minWidth: '180px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 ${
            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <DynamicIcon 
              name={cat?.icon || 'HelpCircle'} 
              className={isLight ? 'text-zinc-600' : 'text-zinc-400'} 
              size={12} 
            />
          </div>
          <span className="font-bold text-[11px] tracking-tight truncate max-w-[130px]">
            {entry.name}
          </span>
        </div>
        <div className="text-sm font-extrabold font-mono mt-0.5">
          {formatIndianNumber(entry.value, currency)}
        </div>
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
          {percentage}% of total expenses
        </div>
      </div>
    );
  };

  return (
    <div id="category-breakdown-card" className={cardStyle} ref={containerRef}>
      <div className="space-y-0.5 mb-4">
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
            className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-300 font-bold px-1 cursor-pointer transition-colors"
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
        <div id="category-breakdown-chart-container" className="flex flex-col justify-between h-full relative">
          <div 
            className="h-44 w-full flex justify-center cursor-pointer relative"
            onClick={() => {
              if (activeCategoryFilter) {
                setActiveCategoryFilter(null);
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onMouseLeave={() => setHoveredIndex(null)}>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  paddingAngle={2.5}
                  dataKey="value"
                  activeIndex={hoveredIndex !== null ? hoveredIndex : categoryChartData.findIndex(c => c.id === activeCategoryFilter)}
                  activeShape={renderActiveShape}
                  onMouseEnter={(data, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(data, index, event) => {
                    if (event) {
                      event.stopPropagation();
                    }
                    const entry = categoryChartData[index];
                    if (!entry) return;

                    if (activeCategoryFilter === entry.id) {
                      setActiveCategoryFilter(null);
                    } else {
                      setActiveCategoryFilter(entry.id);
                      setActiveView('transactions');
                    }
                  }}
                  style={{ outline: 'none' }}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ outline: 'none', transition: 'all 200ms ease-out' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />}
                  active={hoveredIndex !== null}
                  cursor={false}
                  wrapperStyle={{ outline: 'none', pointerEvents: 'none', zIndex: 9999 }}
                  isAnimationActive={false}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
});
