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
  LogOut,
  User,
  Trash2,
  Landmark,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_AVATAR } from '../data/defaultData';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { 
    activeView, 
    setActiveView, 
    theme, 
    appName, 
    appLogo, 
    user, 
    logout,
    mobileDrawerOpen,
    setMobileDrawerOpen
  } = useApp();
  const [menuOpen, setMenuOpen] = React.useState(false);

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
    { id: 'wallets', label: 'Accounts', icon: Landmark },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: Trash2 }
  ];

  const defaultAvatar = DEFAULT_AVATAR;

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
    <>
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
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                boxShadow: isLight 
                  ? '0 4px 12px rgba(0,0,0,0.03)' 
                  : '0 4px 12px rgba(0,0,0,0.15)'
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer group relative ${
                isActive 
                  ? isLight
                    ? 'text-zinc-900'
                    : 'text-white'
                  : isLight
                    ? 'text-zinc-500 hover:text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-200'
              }`}
              style={{
                outline: 'none',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSidebarBg"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className={`absolute inset-0 rounded-xl border ${
                    isLight
                      ? 'bg-zinc-100 border-zinc-200/50 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                  style={{ zIndex: 0 }}
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="activeSideIndicator"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute left-0 w-0.5 h-4 rounded-r bg-emerald-500 dark:bg-zinc-200"
                  style={{ zIndex: 1 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 w-full min-w-0">
                <Icon 
                  size={16} 
                  className={`transition-all shrink-0 ${
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
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Dynamic User Summary */}
      <div className={`p-4 border-t flex flex-col gap-3 relative ${
        isLight ? 'border-zinc-200' : 'border-zinc-800/60'
      }`}>
        {/* Click-away backdrop overlay */}
        {menuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Profile Dropdown Menu */}
        {menuOpen && (
          <div className={`absolute bottom-16 left-4 right-4 z-50 p-2 rounded-2xl border shadow-xl flex flex-col gap-1 transition-all duration-200 ${
            isLight 
              ? 'bg-white border-zinc-200/80 text-zinc-900' 
              : 'bg-zinc-950 border-zinc-850/80 text-zinc-100'
          }`}>
            <button
              onClick={() => {
                setActiveView('settings');
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left ${
                isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-900/55'
              }`}
            >
              <User size={13} className="opacity-80" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setActiveView('settings');
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left ${
                isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-900/55'
              }`}
            >
              <Settings size={13} className="opacity-80" />
              <span>Settings</span>
            </button>
            <div className={`h-px my-1 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800/50'}`} />
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {!collapsed ? (
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center justify-between gap-2 p-1.5 rounded-xl cursor-pointer hover:bg-zinc-500/5 transition-colors select-none`}
            title="Account Actions"
          >
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
            
            <ChevronRight 
              size={12} 
              className={`transition-transform duration-200 shrink-0 ${menuOpen ? 'rotate-90' : ''} ${
                isLight ? 'text-zinc-400' : 'text-zinc-500'
              }`} 
            />
          </div>
        ) : (
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col items-center gap-2 cursor-pointer hover:bg-zinc-500/5 p-1.5 rounded-xl transition-colors"
            title="Account Actions"
          >
            <img 
              src={user?.avatarUrl || defaultAvatar} 
              alt={`${user?.name || 'User'} avatar`} 
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
            />
          </div>
        )}
      </div>
    </motion.aside>

      {/* Mobile/Tablet Slide-out Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-out drawer panel with Swipe-to-Close drag gestures */}
            <motion.div
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: -280, right: 0 }}
              dragElastic={{ left: 0.02, right: 0.15 }}
              onDragEnd={(event, info) => {
                if (info.offset.x < -60 || info.velocity.x < -300) {
                  setMobileDrawerOpen(false);
                }
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative flex flex-col h-full w-[280px] max-w-[85vw] border-r shadow-2xl z-50 ${getSidebarBgClass()}`}
            >
              {/* Drawer Brand & Close Header */}
              <div className={`h-16 flex items-center justify-between px-5 border-b shrink-0 ${
                isLight ? 'border-zinc-200' : 'border-zinc-800/60'
              }`}>
                <div className="flex items-center gap-3">
                  {appLogo ? (
                    <img src={appLogo} alt="App Logo" className="h-9 w-9 rounded-xl object-cover shadow-sm shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm shrink-0">
                      <TrendingUp className="text-white dark:text-zinc-900 h-4 w-4" />
                    </div>
                  )}
                  <span className={`text-xs tracking-wider uppercase ${getLogoTextClass()}`}>
                    {appName || 'Spendly'}
                  </span>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900' 
                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Close sidebar"
                >
                  <X size={14} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Navigation Menu Links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer group relative ${
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
                        <div className="absolute left-0 w-0.5 h-4 rounded-r bg-emerald-500 dark:bg-zinc-200" />
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
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Dynamic User Profile / Logout Section at the Bottom */}
              <div className={`p-4 border-t flex flex-col gap-3 relative ${
                isLight ? 'border-zinc-200' : 'border-zinc-800/60'
              }`}>
                {/* Profile panel display */}
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={user?.avatarUrl || defaultAvatar} 
                    alt={`${user?.name || 'User'} avatar`} 
                    className="h-9 w-9 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800 shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-xs truncate">{user?.name || 'User'}</span>
                    <span className={`text-[10px] truncate ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>

                <div className={`h-px ${isLight ? 'bg-zinc-100' : 'bg-zinc-800/50'}`} />

                {/* Direct clean Settings & Logout actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setMobileDrawerOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700' 
                        : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Settings size={12} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileDrawerOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
