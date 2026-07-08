import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  PieChart, 
  Target, 
  FolderKanban, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeView, setActiveView, theme, appName, appLogo, user, logout } = useApp();

  const isLight = theme === 'light';

  // Specific high-contrast, beautiful branding colors mapped for each theme
  const getLogoTextClass = () => {
    switch (theme) {
      case 'light': 
        return 'text-zinc-900 font-extrabold';
      case 'midnight': 
        return 'text-blue-400 font-extrabold';
      case 'forest': 
        return 'text-teal-400 font-extrabold';
      case 'sunset': 
        return 'text-rose-400 font-extrabold';
      case 'amethyst': 
        return 'text-purple-400 font-extrabold';
      case 'dark':
      default:
        return 'text-zinc-100 font-extrabold';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';

  const getSidebarBgClass = () => {
    switch (theme) {
      case 'light': return 'bg-white border-zinc-200 text-zinc-900';
      case 'midnight': return 'bg-[#0a0f1d] border-blue-900/20 text-zinc-100';
      case 'forest': return 'bg-[#0c140f] border-green-900/20 text-zinc-100';
      case 'sunset': return 'bg-[#1a0e12] border-red-900/20 text-zinc-100';
      case 'amethyst': return 'bg-[#110c1c] border-purple-900/20 text-zinc-100';
      case 'dark':
      default:
        return 'bg-[#09090b] border-zinc-800/60 text-zinc-100';
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`hidden md:flex h-screen sticky top-0 flex-col border-r shadow-sm z-30 shrink-0 ${getSidebarBgClass()}`}
    >
      {/* Brand Logo Header */}
      <div className={`h-16 flex items-center justify-between px-5 border-b relative ${
        isLight ? 'border-zinc-200' : 'border-zinc-800/60'
      }`}>
        <div className="flex items-center gap-3">
          {appLogo ? (
            <img src={appLogo} alt="App Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp className="text-white dark:text-zinc-900 h-5 w-5" />
            </div>
          )}
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className={`text-sm tracking-tight ${getLogoTextClass()}`}>
                {appName || 'Spendly'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Floating Collapse Handle Sitting directly on the border line */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-5 h-6 w-6 rounded-full border transition-all cursor-pointer flex items-center justify-center shadow-md ${
            isLight 
              ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900' 
              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
          style={{ zIndex: 40 }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group relative ${
                isActive 
                  ? isLight
                    ? 'bg-zinc-100 text-zinc-900 border border-zinc-200/50 shadow-sm'
                    : 'bg-zinc-900 text-white border border-zinc-800'
                  : isLight
                    ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSideIndicator"
                  className="absolute left-0 w-0.5 h-4 rounded-r bg-emerald-500 dark:bg-zinc-200"
                />
              )}
              <Icon 
                size={16} 
                className={`transition-all ${
                  isActive 
                    ? 'text-emerald-500 dark:text-white' 
                    : isLight 
                      ? 'text-zinc-400 group-hover:text-zinc-700' 
                      : 'text-zinc-500 group-hover:text-zinc-300'
                }`} 
              />
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Dynamic User Summary */}
      <div className={`p-4 border-t flex flex-col gap-3 ${
        isLight ? 'border-zinc-200' : 'border-zinc-800/60'
      }`}>
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 p-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img 
                src={user?.avatarUrl || defaultAvatar} 
                alt={`${user?.name || 'User'} avatar`} 
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs truncate">{user?.name || 'User'}</span>
                <span className={`text-[10px] truncate ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => logout()}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all cursor-pointer shrink-0"
              title="Log Out of Account"
            >
              <LogOut size={13} className="stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img 
              src={user?.avatarUrl || defaultAvatar} 
              alt={`${user?.name || 'User'} avatar`} 
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
            />
            <button 
              onClick={() => logout()}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
              title="Log Out of Account"
            >
              <LogOut size={12} className="stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
