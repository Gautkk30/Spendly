import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Plus, 
  Settings 
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  onOpenAddTx: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onOpenAddTx }) => {
  const { activeView, setActiveView, theme, wallets } = useApp();

  const isLight = theme === 'light';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger', icon: ArrowLeftRight },
    ...(wallets.length > 0 ? [{ id: 'add_trigger', label: 'Add', icon: Plus, isAction: true }] : []),
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getBgClass = () => {
    switch (theme) {
      case 'light': return 'bg-white/90 border-zinc-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]';
      case 'midnight': return 'bg-[#0a0f1d]/90 border-blue-900/20 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]';
      case 'forest': return 'bg-[#0c140f]/90 border-green-900/20 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]';
      case 'sunset': return 'bg-[#1a0e12]/90 border-red-900/20 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]';
      case 'amethyst': return 'bg-[#110c1c]/90 border-purple-900/20 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]';
      case 'dark':
      default:
        return 'bg-[#09090b]/90 border-zinc-900/80 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]';
    }
  };

  const getActiveTextClass = () => {
    switch (theme) {
      case 'light': return 'text-zinc-900';
      case 'midnight': return 'text-blue-400';
      case 'forest': return 'text-teal-400';
      case 'sunset': return 'text-rose-400';
      case 'amethyst': return 'text-purple-400';
      case 'dark':
      default:
        return 'text-emerald-400';
    }
  };

  const getActionBgClass = () => {
    switch (theme) {
      case 'midnight': return 'bg-blue-500 text-white shadow-lg shadow-blue-500/25';
      case 'forest': return 'bg-teal-500 text-white shadow-lg shadow-teal-500/25';
      case 'sunset': return 'bg-rose-500 text-white shadow-lg shadow-rose-500/25';
      case 'amethyst': return 'bg-purple-500 text-white shadow-lg shadow-purple-500/25';
      case 'light': return 'bg-zinc-900 text-white shadow-lg shadow-zinc-950/15';
      case 'dark':
      default:
        return 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25';
    }
  };

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-2 border-t backdrop-blur-xl transition-all ${getBgClass()}`}>
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenAddTx}
                className={`relative -translate-y-4 flex items-center justify-center h-12 w-12 rounded-full active:scale-95 transition-transform cursor-pointer ${getActionBgClass()}`}
                title="Log transaction entry"
              >
                <Icon size={20} className="stroke-[3]" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-2 select-none cursor-pointer"
            >
              <div className="relative">
                <Icon 
                  size={18} 
                  className={`transition-all duration-200 ${
                    isActive 
                      ? `${getActiveTextClass()} scale-110` 
                      : isLight ? 'text-zinc-400 hover:text-zinc-600' : 'text-zinc-500 hover:text-zinc-300'
                  }`} 
                />
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1 rounded-full bg-current"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[9px] mt-1 font-semibold tracking-wide transition-all ${
                isActive 
                  ? getActiveTextClass() 
                  : isLight ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
