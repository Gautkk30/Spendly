import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction 
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 border rounded-3xl ${
        isLight
          ? 'bg-zinc-50/50 border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]'
          : 'bg-[#0b0b0e] border-zinc-900 shadow-2xl shadow-black/20'
      }`}
    >
      {/* Premium Outer Glowing Circle */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full w-14 h-14" />
        <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center relative z-10 transition-colors ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-600 shadow-sm'
            : 'bg-zinc-950 border-zinc-850 text-emerald-400'
        }`}>
          <Icon size={20} className="stroke-[1.8]" />
        </div>
      </div>

      {/* Structured Text Details */}
      <div className="space-y-1.5 max-w-sm mb-6">
        <h3 className={`text-sm font-extrabold tracking-tight ${
          isLight ? 'text-zinc-900' : 'text-zinc-100'
        }`}>
          {title}
        </h3>
        <p className={`text-xs ${
          isLight ? 'text-zinc-500' : 'text-zinc-400'
        } leading-relaxed`}>
          {description}
        </p>
      </div>

      {/* Action Button */}
      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="px-4 py-2 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl shadow-lg shadow-black/10 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight size={13} className="stroke-[2.5]" />
        </motion.button>
      )}
    </motion.div>
  );
};
