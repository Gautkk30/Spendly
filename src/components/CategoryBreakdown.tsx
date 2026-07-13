import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatIndianNumber } from '../utils/format';
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
    setActiveCategoryFilter 
  } = useApp();

  const [cardPosition, setCardPosition] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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

  // Synchronize state when activeCategoryFilter changes from elsewhere (e.g., cleared)
  useEffect(() => {
    if (activeCategoryFilter === null) {
      setCardPosition(null);
    }
  }, [activeCategoryFilter]);

  // Handle outside click, escape key, window resize, and scroll to dismiss
  useEffect(() => {
    const dismissAll = () => {
      setActiveCategoryFilter(null);
      setCardPosition(null);
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

    window.addEventListener('scroll', dismissAll, { passive: true });
    window.addEventListener('resize', dismissAll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', dismissAll);
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
      setCardPosition(null);
    } else {
      // Set the active filter globally
      setActiveCategoryFilter(entry.id);

      // Extract details to calculate visual midpoint positioning of selected slice
      const angle = data.midAngle;
      const cx = data.cx ?? 100;
      const cy = data.cy ?? 100;
      const outerRadius = data.outerRadius ?? 70;

      const rad = Math.PI / 180;
      const angleRad = -angle * rad;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      // Offset position slightly outwards from outer radius
      const offsetDist = outerRadius + 20; 
      const targetX = cx + offsetDist * cos;
      const targetY = cy + offsetDist * sin;

      const cardWidth = 180;
      const cardHeight = 100;

      let posX = targetX;
      // Adjust alignments based on quadrants so the card is pushed outwards away from the slice
      if (cos > 0.3) {
        posX = targetX + 5;
      } else if (cos < -0.3) {
        posX = targetX - cardWidth - 5;
      } else {
        posX = targetX - (cardWidth / 2);
      }

      let posY = targetY;
      if (sin > 0.3) {
        posY = targetY + 5;
      } else if (sin < -0.3) {
        posY = targetY - cardHeight - 5;
      } else {
        posY = targetY - (cardHeight / 2);
      }

      // Clamp coordinates perfectly inside container limits to guarantee no overflows
      if (chartContainerRef.current) {
        const W = chartContainerRef.current.clientWidth || 300;
        const H = chartContainerRef.current.clientHeight || 176;
        
        posX = Math.max(8, Math.min(posX, W - cardWidth - 8));
        posY = Math.max(8, Math.min(posY, H - cardHeight - 8));
      }

      setCardPosition({ x: posX, y: posY });
    }
  };

  const selectedIndex = activeCategoryFilter !== null 
    ? categoryChartData.findIndex(c => c.id === activeCategoryFilter) 
    : -1;

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
              setCardPosition(null);
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
        <div 
          id="category-breakdown-chart-container" 
          ref={chartContainerRef}
          className="flex flex-col justify-between h-full relative min-h-[176px]"
        >
          <div 
            className="h-44 w-full flex justify-center cursor-pointer relative"
            onClick={() => {
              if (activeCategoryFilter) {
                setActiveCategoryFilter(null);
                setCardPosition(null);
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

          {/* Floating selected category information card */}
          {activeCategoryFilter && cardPosition && (() => {
            const activeIndex = categoryChartData.findIndex(c => c.id === activeCategoryFilter);
            if (activeIndex === -1) return null;
            const entry = categoryChartData[activeIndex];
            const totalSpending = categoryChartData.reduce((sum, c) => sum + c.value, 0);
            const percentage = totalSpending > 0 ? Math.round((entry.value / totalSpending) * 100) : 0;
            const cat = categories.find(c => c.id === entry.id);

            return (
              <div 
                id="category-selected-info-card"
                className={`absolute rounded-2xl border p-3.5 flex flex-col gap-1.5 text-left transition-all duration-200 ease-out z-[999] shadow-xl ${
                  isLight 
                    ? 'bg-white border-zinc-100 text-zinc-900 shadow-zinc-200/50' 
                    : 'bg-zinc-950 border-zinc-850 text-zinc-100 shadow-black/40'
                }`}
                style={{
                  left: `${cardPosition.x}px`,
                  top: `${cardPosition.y}px`,
                  width: '180px',
                  backdropFilter: 'blur(12px)',
                  willChange: 'left, top',
                  pointerEvents: 'auto'
                }}
                onClick={(e) => e.stopPropagation()} // Prevent dismiss when clicking the card itself
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
          })()}
        </div>
      )}
    </div>
  );
});
