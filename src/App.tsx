import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import TransactionsView from './components/TransactionsView';
import BudgetsView from './components/BudgetsView';
import GoalsView from './components/GoalsView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';
import RecycleBinView from './components/RecycleBinView';
import WalletsView from './components/WalletsView';
import AddTxModal from './components/AddTxModal';
import AddWalletModal from './components/AddWalletModal';
import OCRModal from './components/OCRModal';
import BottomNavigation from './components/BottomNavigation';
import { Loader2, AlertCircle, Trash2, Plus, ArrowRight, Mail, User, ShieldAlert, Sparkles, RotateCcw, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommandPalette } from './components/CommandPalette';
import { WelcomeTour } from './components/WelcomeTour';
import PWAManager from './components/PWAManager';
import { AuroraBackground } from './components/AuroraBackground';

const appAnimationVariants = {
  loading: {
    filter: 'blur(0px)',
    scale: 1,
    opacity: 1,
  },
  loaded: {
    filter: 'blur(0px)',
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
    }
  }
};

function LoginPage() {
  const { appName, appLogo, login, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium ambient backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-[120px] rounded-full w-96 h-96 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 left-1/4 bg-teal-500/5 blur-[100px] rounded-full w-80 h-80 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          {appLogo ? (
            <img src={appLogo} alt="App Logo" className="h-20 w-20 rounded-3xl object-cover shadow-2xl ring-1 ring-zinc-800" />
          ) : (
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-zinc-950 flex items-center justify-center">
                <span className="text-3xl font-black bg-gradient-to-tr from-emerald-400 to-teal-300 bg-clip-text text-transparent">S</span>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-wider bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent uppercase">
              {appName || 'Spendly'}
            </h1>
            <p className="text-xs text-zinc-500 tracking-wider uppercase font-bold flex items-center justify-center gap-1.5">
              <span>Secure Personal Ledger</span>
            </p>
          </div>
        </div>

        {/* Clean, Premium Sign-in Block */}
        <div className="bg-zinc-900/40 border border-zinc-850/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-100">Welcome to {appName || 'Spendly'}</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Please sign in with your Google account to access your personal workspace, transaction ledgers, and intelligent insights.
            </p>
          </div>

          <button
            onClick={() => login()}
            disabled={isLoading}
            className="w-full py-3.5 px-5 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-lg shadow-white/5 disabled:opacity-50"
          >
            {/* Google Vector Icon */}
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.49c0,-0.61 -0.05,-1.2 -0.15,-1.78Z" fill="#4285F4" />
              <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-2.92,-2.27c-0.8,0.54 -1.84,0.87 -3.04,0.87c-2.34,0 -4.33,-1.58 -5.04,-3.7H3.92v2.21c1.5,2.98 4.6,5.07 8.08,5.07Z" fill="#34A853" />
              <path d="M6.96,13.34c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.73H3.92C3.31,8.95 3,10.32 3,11.64c0,1.32 0.31,2.69 0.92,3.91l3.04,-2.21Z" fill="#FBBC05" />
              <path d="M12,6.76c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.09 14.42,3.38 12,3.38c-3.48,0 -6.58,2.09 -8.08,5.07l3.04,2.21c0.71,-2.12 2.7,-3.7 5.04,-3.7Z" fill="#EA4335" />
            </svg>
            <span>Sign In with Google</span>
          </button>
          
          <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
            Your data is safely isolated. Only one authenticated user session may exist at a time.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardLayout() {
  const { 
    activeView, 
    setActiveView, 
    isLoading, 
    error, 
    theme, 
    user,
    undoItem,
    triggerUndo,
    dismissUndo,
    isAddWalletOpen,
    setAddWalletOpen,
    toasts,
    showToast
  } = useApp();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  
  // Custom Command Palette & Onboarding States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  
  // Hold active transaction being edited
  const [editingTx, setEditingTx] = useState<any | null>(null);

  // Mouse Tracking for Radial Glow Follow Effect
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Global button ripple listener
  useEffect(() => {
    const handleGlobalRipple = (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest('button');
      if (!button) return;
      if (button.classList.contains('no-ripple')) return;

      const circle = document.createElement('span');
      const dialogueRect = button.getBoundingClientRect();
      
      const diameter = Math.max(dialogueRect.width, dialogueRect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - dialogueRect.left - radius}px`;
      circle.style.top = `${e.clientY - dialogueRect.top - radius}px`;
      circle.classList.add('ripple-span');

      if (theme === 'light') {
        circle.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
      } else {
        circle.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
      }

      const originalPosition = window.getComputedStyle(button).position;
      if (originalPosition === 'static') {
        button.style.position = 'relative';
      }
      const originalOverflow = window.getComputedStyle(button).overflow;
      if (originalOverflow !== 'hidden') {
        button.style.overflow = 'hidden';
      }

      button.appendChild(circle);

      setTimeout(() => {
        circle.remove();
      }, 500);
    };

    document.addEventListener('click', handleGlobalRipple);
    return () => {
      document.removeEventListener('click', handleGlobalRipple);
    };
  }, [theme]);

  // Intercept all default alert() calls across the app to render as custom toasts
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      showToast(message, 'info');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  // Trigger tour automatically for new users after 1.2 seconds
  useEffect(() => {
    if (user) {
      const tourCompleted = localStorage.getItem('spendly_tour_completed');
      if (!tourCompleted) {
        const timer = setTimeout(() => {
          setTourOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' ||
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      const key = e.key.toLowerCase();

      // Toggle command palette: Cmd/Ctrl + K or /
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Add transaction modal: N or T
      if (key === 'n' || key === 't') {
        e.preventDefault();
        setAddTxOpen(true);
        return;
      }

      // Receipt OCR scanner: R or S
      if (key === 'r' || key === 's') {
        e.preventDefault();
        setOcrOpen(true);
        return;
      }

      // Navigation tabs: numbers 1-7
      if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        e.preventDefault();
        const views = ['dashboard', 'wallets', 'transactions', 'budgets', 'goals', 'categories', 'settings'];
        const idx = parseInt(e.key, 10) - 1;
        if (views[idx]) {
          setActiveView(views[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [user, setActiveView]);

  const handleEditTx = (tx: any) => {
    setEditingTx(tx);
    setAddTxOpen(true);
  };

  const handleCloseAddTx = () => {
    setAddTxOpen(false);
    setEditingTx(null);
  };

  const getThemeBgClass = () => {
    switch (theme) {
      case 'light': return 'bg-zinc-50 text-zinc-900';
      case 'midnight': return 'bg-[#0a0f1d] text-zinc-100';
      case 'forest': return 'bg-[#0c140f] text-zinc-100';
      case 'sunset': return 'bg-[#1a0e12] text-zinc-100';
      case 'amethyst': return 'bg-[#110c1c] text-zinc-100';
      case 'dark':
      default:
        return 'bg-[#09090b] text-zinc-100';
    }
  };

  const getFabBgClass = () => {
    switch (theme) {
      case 'midnight': return 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30';
      case 'forest': return 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30';
      case 'sunset': return 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30';
      case 'amethyst': return 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30';
      case 'light': return 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-950/20';
      case 'dark':
      default:
        return 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/30';
    }
  };

  if (!user) {
    return (
      <>
        <LoginPage />
        {/* Simple loader if account switches are active */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
              }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/65 backdrop-blur-md"
            >
              <div className="relative w-10 h-10 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" style={{ animationDuration: '0.8s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <motion.div 
        variants={appAnimationVariants}
        animate={isLoading ? "loading" : "loaded"}
        className={`h-screen flex ${getThemeBgClass()} w-full relative overflow-hidden`}
        data-theme={theme}
      >
        
        {/* 1. Left Animated Collapsible Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* 2. Main Workspace Block */}
        <div 
          className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle Ambient Aurora Background */}
          <AuroraBackground theme={theme} />

          {/* Mouse Follow Radial Light Glow */}
          {isHovered && (
            <div
              className="pointer-events-none absolute rounded-full opacity-70 z-0 transition-opacity duration-500"
              style={{
                width: '450px',
                height: '450px',
                background: theme === 'light' 
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%)'
                  : theme === 'midnight'
                  ? 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0) 70%)'
                  : theme === 'sunset'
                  ? 'radial-gradient(circle, rgba(239, 68, 68, 0.06) 0%, rgba(239, 68, 68, 0) 70%)'
                  : theme === 'forest'
                  ? 'radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, rgba(34, 197, 94, 0) 70%)'
                  : theme === 'amethyst'
                  ? 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0) 70%)'
                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, rgba(16, 185, 129, 0) 70%)',
                left: mousePos.x - 225,
                top: mousePos.y - 225,
              }}
            />
          )}
          
          {/* Upper Header Control Actions */}
          <Header 
            onOpenAddTx={() => setAddTxOpen(true)} 
            onOpenOCR={() => setOcrOpen(true)} 
          />

          {/* Core View Stage with transitions */}
          <main className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto relative">
            
            {error ? (
              <div className={`max-w-md mx-auto mt-20 p-6 border rounded-2xl text-center space-y-4 shadow-xl ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
                <AlertCircle size={32} className="text-red-500 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm">Unable to Load Data</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl transition-all"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  {activeView === 'dashboard' && (
                    <DashboardOverview 
                      onOpenAddTx={() => setAddTxOpen(true)} 
                      onEditTx={handleEditTx} 
                    />
                  )}
                  {activeView === 'wallets' && <WalletsView />}
                  {activeView === 'transactions' && (
                    <TransactionsView 
                      onOpenAddTx={() => setAddTxOpen(true)} 
                      onEditTx={handleEditTx} 
                    />
                  )}
                  {activeView === 'budgets' && <BudgetsView />}
                  {activeView === 'goals' && <GoalsView />}
                  {activeView === 'categories' && <CategoriesView />}
                  {activeView === 'settings' && <SettingsView />}
                  {activeView === 'recycle-bin' && <RecycleBinView />}
                </motion.div>
              </AnimatePresence>
            )}

          </main>
        </div>

        {/* ==========================================
            MODALS & LAUNCHERS
           ========================================== */}
        
        {/* Transaction Addition & Editing Form Modal */}
        <AddTxModal 
          isOpen={addTxOpen} 
          onClose={handleCloseAddTx} 
          editTx={editingTx} 
        />

        {/* Wallet Addition Modal */}
        <AddWalletModal
          isOpen={isAddWalletOpen}
          onClose={() => setAddWalletOpen(false)}
        />

        {/* AI Receipt Scanner Modal */}
        <OCRModal 
          isOpen={ocrOpen} 
          onClose={() => setOcrOpen(false)} 
        />

        {/* Floating Glassmorphic Mobile Bottom Navigation */}
        <BottomNavigation onOpenAddTx={() => setAddTxOpen(true)} />

        {/* Mobile Command Palette FAB Launcher (Left Side) */}
        <div className="md:hidden fixed bottom-20 left-4 z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCommandPaletteOpen(true)}
            className="h-11 w-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label="Open Command Search"
          >
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-emerald-400 hover:text-emerald-300">
              <Sparkles size={16} className="stroke-[2.5]" />
            </div>
          </motion.button>
        </div>

        {/* Mobile Add Transaction FAB (Right Side) */}
        <div className="md:hidden fixed bottom-20 right-4 z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setAddTxOpen(true)}
            className={`h-11 w-11 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${getFabBgClass()}`}
            aria-label="Add Transaction"
          >
            <Plus size={20} className="stroke-[3]" />
          </motion.button>
        </div>

        {/* Global Command Palette */}
        <CommandPalette 
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onOpenAddTx={() => setAddTxOpen(true)}
          onOpenOCR={() => setOcrOpen(true)}
          onStartTour={() => setTourOpen(true)}
        />

        {/* Interactive Welcome Tour Onboarding */}
        <WelcomeTour 
          isOpen={tourOpen}
          onClose={() => setTourOpen(false)}
        />

        {/* Floating Undo Deletion Toast */}
        <AnimatePresence>
          {undoItem && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-4 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                theme === 'light'
                  ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/50'
                  : 'bg-zinc-950/90 border-zinc-800 text-zinc-100 shadow-black/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold">{undoItem.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold">
                  {undoItem.countdown}s
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800/40 dark:border-zinc-800/80">
                <button
                  onClick={triggerUndo}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} className="stroke-[2.5]" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={dismissUndo}
                  className="p-1.5 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Dismiss</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Animated Toast Notifications Container */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts && toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.92, transition: { duration: 0.18 } }}
                layout
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                  theme === 'light'
                    ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-200/40'
                    : 'bg-zinc-950/90 border-zinc-800 text-zinc-100 shadow-black/80'
                }`}
              >
                {toast.type === 'success' && (
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <AlertCircle size={13} className="stroke-[2.5]" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Info size={13} className="stroke-[2.5]" />
                  </div>
                )}
                <span className="text-xs font-semibold leading-tight">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dynamic Progressive Web App Manager */}
        <PWAManager />

      </motion.div>

      {/* Cinematic Glassmorphic Loader Overlay */}
      <AnimatePresence>
        {!user && isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/65 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center select-none"
            >
              {/* Elegant floating logo with emerald pulse glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full w-24 h-24 -translate-x-4 -translate-y-4 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/10 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center">
                    <span className="text-2xl font-black bg-gradient-to-tr from-emerald-400 to-teal-300 bg-clip-text text-transparent">S</span>
                  </div>
                </div>
              </div>

              {/* Glowing Title */}
              <h1 className="text-2xl font-black tracking-widest text-white mb-1">
                SPENDLY
              </h1>
              <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-extrabold mb-8">
                Intelligent Wealth Engine
              </p>

              {/* Dual-ring orbital micro-spinner */}
              <div className="relative w-10 h-10 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" style={{ animationDuration: '0.8s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-teal-400 animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
              </div>

              <span className="text-[11px] font-bold text-zinc-400 tracking-wide">
                Assembling secure ledger...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardLayout />
    </AppProvider>
  );
}
