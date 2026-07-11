import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Scan, 
  Plus, 
  Check, 
  Trash2,
  AlertTriangle,
  Info,
  CalendarCheck,
  Loader2
} from 'lucide-react';
import { CURRENCIES } from '../data/defaultData';
import { CurrencyCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenAddTx: () => void;
  onOpenOCR: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTx, onOpenOCR }) => {
  const { 
    theme, 
    setTheme, 
    currency, 
    setCurrency, 
    globalSearch, 
    setGlobalSearch,
    notifications,
    markNotificationRead,
    clearNotifications,
    activeView,
    setActiveView,
    appName,
    appLogo,
    isSaving,
    isOffline
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);

  const isLight = theme === 'light';

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as CurrencyCode);
  };

  const toggleTheme = () => {
    const list: ('light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst')[] = ['light', 'dark', 'midnight', 'forest', 'sunset', 'amethyst'];
    const idx = list.indexOf(theme);
    const nextTheme = list[(idx + 1) % list.length];
    setTheme(nextTheme);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getHeaderBgClass = () => {
    switch (theme) {
      case 'light': return 'bg-white/80 border-zinc-200';
      case 'midnight': return 'bg-[#0a0f1d]/80 border-blue-900/20';
      case 'forest': return 'bg-[#0c140f]/80 border-green-900/20';
      case 'sunset': return 'bg-[#1a0e12]/80 border-red-900/20';
      case 'amethyst': return 'bg-[#110c1c]/80 border-purple-900/20';
      case 'dark':
      default:
        return 'bg-[#09090b]/80 border-zinc-800/60';
    }
  };

  return (
    <header className={`h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl border-b ${getHeaderBgClass()}`}>
      {/* Brand logo/name only visible on mobile (since sidebar is hidden) */}
      <div className="flex md:hidden items-center gap-2.5 mr-3 shrink-0">
        {appLogo ? (
          <img src={appLogo} alt="App Logo" className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-800" />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center">
              <span className="text-xs font-black bg-gradient-to-tr from-emerald-400 to-teal-300 bg-clip-text text-transparent">S</span>
            </div>
          </div>
        )}
        <span className={`text-[12px] font-extrabold tracking-wider uppercase ${
          theme === 'light' ? 'text-zinc-900' : 'text-zinc-100'
        }`}>
          {appName || 'Spendly'}
        </span>
      </div>

      {/* Search Input Area (Hidden on mobile, since there's search in Transactions tab) */}
      <div className="hidden md:block w-80 relative">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
          isLight ? 'text-zinc-400' : 'text-zinc-500'
        }`} />
        <input 
          type="text" 
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            if (e.target.value && activeView !== 'transactions') {
              setActiveView('transactions');
            }
          }}
          placeholder="Search ledger..."
          className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all ${
            isLight 
              ? 'bg-zinc-100/60 hover:bg-zinc-100 focus:bg-zinc-100 text-zinc-900 placeholder-zinc-400 border-zinc-200/80 focus:border-zinc-300 focus:ring-zinc-300' 
              : 'bg-zinc-900/60 hover:bg-zinc-900 focus:bg-zinc-900 text-zinc-100 placeholder-zinc-500 border-zinc-800/80 focus:border-zinc-700 focus:ring-zinc-700'
          }`}
        />
      </div>

      {/* Saving and Connection Indicators */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        {isOffline ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>Offline</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        )}

        {/* Cloud saving status */}
        <AnimatePresence mode="wait">
          {isSaving === 'saving' && (
            <motion.div
              key="saving"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest"
            >
              <Loader2 size={10} className="animate-spin text-emerald-500" />
              <span>Saving...</span>
            </motion.div>
          )}
          {isSaving === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest"
            >
              <Check size={10} className="stroke-[3.5]" />
              <span>Saved</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Control Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions Buttons (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={onOpenOCR}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200 shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border-zinc-800'
            }`}
          >
            <Scan size={13} className={isLight ? 'text-zinc-500' : 'text-zinc-400'} />
            <span>Scan Receipt</span>
          </button>
          
          <button 
            onClick={onOpenAddTx}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
            }`}
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Scan Shortcut for Mobile ONLY */}
        <button 
          onClick={onOpenOCR}
          className={`sm:hidden p-1.5 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600'
              : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}
          title="Scan Receipt with AI"
        >
          <Scan size={14} />
        </button>

        {/* Vertical Divider */}
        <div className={`h-4 w-px ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />

        {/* Currency Picker */}
        <div className="relative">
          <select 
            value={currency} 
            onChange={handleCurrencyChange}
            className={`appearance-none rounded-xl px-2 py-1.5 pr-6 text-[11px] font-bold focus:outline-none cursor-pointer transition-all border ${
              isLight
                ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border-zinc-800'
            }`}
          >
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <div className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[7px] font-bold ${
            isLight ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            ▼
          </div>
        </div>

        {/* Light/Dark Toggle */}
        <button 
          onClick={toggleTheme}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600'
              : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer relative ${
              isLight
                ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600'
                : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                {/* Overlay to close */}
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-3 w-80 rounded-xl border shadow-xl z-50 overflow-hidden ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-900'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-100'
                  }`}
                >
                  <div className={`p-3.5 border-b flex items-center justify-between ${
                    isLight ? 'bg-zinc-50/50 border-zinc-100' : 'bg-zinc-950/40 border-zinc-850'
                  }`}>
                    <span className="font-semibold text-xs tracking-wide uppercase">Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-zinc-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 size={10} /> Clear all
                      </button>
                    )}
                  </div>

                  <div className={`max-h-64 overflow-y-auto divide-y ${
                    isLight ? 'divide-zinc-100' : 'divide-zinc-800/50'
                  }`}>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center space-y-2.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto ${
                          isLight ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-950 text-zinc-500'
                        }`}>
                          <Bell size={14} />
                        </div>
                        <div className="space-y-0.5">
                          <p className={`text-xs font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>No recent alerts</p>
                          <p className="text-[10px] text-zinc-400 leading-normal max-w-[180px] mx-auto">We'll notify you when budget warnings or goal landmarks trigger.</p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 transition-all relative ${
                            notif.read 
                              ? 'opacity-60' 
                              : isLight 
                                ? 'bg-zinc-50/40' 
                                : 'bg-zinc-950/20'
                          }`}
                        >
                          <div className="flex gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'warning' && <AlertTriangle className="text-amber-500 h-3.5 w-3.5" />}
                              {notif.type === 'alert' && <AlertTriangle className="text-red-500 h-3.5 w-3.5" />}
                              {notif.type === 'success' && <CalendarCheck className="text-emerald-500 h-3.5 w-3.5" />}
                              {notif.type === 'info' && <Info className="text-blue-500 h-3.5 w-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs leading-tight truncate">{notif.title}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{notif.message}</p>
                              <p className="text-[9px] text-zinc-500 mt-1">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {!notif.read && (
                              <button 
                                onClick={() => markNotificationRead(notif.id)}
                                className={`h-4.5 w-4.5 border rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                                  isLight 
                                    ? 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300' 
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                                }`}
                                title="Mark as read"
                              >
                                <Check size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
