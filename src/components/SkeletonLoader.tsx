import React from 'react';
import { useApp } from '../context/AppContext';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'chart' | 'stat';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  count = 1, 
  className = '' 
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const shimmerBg = isLight 
    ? 'bg-zinc-200/60' 
    : 'bg-zinc-900/60';

  const shimmerHighlight = isLight
    ? 'after:from-transparent after:via-white/45 after:to-transparent'
    : 'after:from-transparent after:via-zinc-800/40 after:to-transparent';

  const baseShimmer = `relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r ${shimmerHighlight}`;

  const renderSkeleton = (idx: number) => {
    switch (variant) {
      case 'stat':
        return (
          <div key={idx} className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0f0f12] border-zinc-900'} space-y-4`}>
            <div className="flex items-center justify-between">
              <div className={`h-3 w-20 rounded-md ${shimmerBg} ${baseShimmer}`} />
              <div className={`h-8 w-8 rounded-lg ${shimmerBg} ${baseShimmer}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-6 w-32 rounded-md ${shimmerBg} ${baseShimmer}`} />
              <div className={`h-3.5 w-24 rounded-md ${shimmerBg} ${baseShimmer}`} />
            </div>
          </div>
        );

      case 'chart':
        return (
          <div key={idx} className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-[#0f0f12] border-zinc-900'} space-y-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1.5">
                <div className={`h-4 w-36 rounded-md ${shimmerBg} ${baseShimmer}`} />
                <div className={`h-3 w-48 rounded-md ${shimmerBg} ${baseShimmer}`} />
              </div>
              <div className={`h-7 w-20 rounded-lg ${shimmerBg} ${baseShimmer}`} />
            </div>
            <div className={`h-56 w-full rounded-2xl ${shimmerBg} ${baseShimmer} opacity-40`} />
          </div>
        );

      case 'list':
        return (
          <div key={idx} className="space-y-3.5">
            {[1, 2, 3, 4].map((row) => (
              <div 
                key={row} 
                className={`flex items-center justify-between p-3 border rounded-2xl ${
                  isLight ? 'bg-white border-zinc-100' : 'bg-[#0e0e11] border-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3 w-2/3">
                  <div className={`h-8 w-8 rounded-lg shrink-0 ${shimmerBg} ${baseShimmer}`} />
                  <div className="space-y-1.5 w-full">
                    <div className={`h-3 w-1/3 rounded-md ${shimmerBg} ${baseShimmer}`} />
                    <div className={`h-2.5 w-1/4 rounded-md ${shimmerBg} ${baseShimmer}`} />
                  </div>
                </div>
                <div className="space-y-1.5 w-1/6 flex flex-col items-end">
                  <div className={`h-3.5 w-12 rounded-md ${shimmerBg} ${baseShimmer}`} />
                  <div className={`h-2 w-10 rounded-md ${shimmerBg} ${baseShimmer}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'card':
      default:
        return (
          <div 
            key={idx} 
            className={`p-5 rounded-3xl border ${
              isLight ? 'bg-white border-zinc-200' : 'bg-[#0e0e11] border-zinc-900'
            } space-y-3`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl shrink-0 ${shimmerBg} ${baseShimmer}`} />
              <div className="space-y-1.5 w-full">
                <div className={`h-3 w-1/2 rounded-md ${shimmerBg} ${baseShimmer}`} />
                <div className={`h-2 w-1/3 rounded-md ${shimmerBg} ${baseShimmer}`} />
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
              <div className={`h-4 w-12 rounded-md ${shimmerBg} ${baseShimmer}`} />
              <div className={`h-3 w-8 rounded-md ${shimmerBg} ${baseShimmer}`} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </div>
  );
};
