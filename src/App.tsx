import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import TransactionsView from './components/TransactionsView';
import BudgetsView from './components/BudgetsView';
import GoalsView from './components/GoalsView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';
import AddTxModal from './components/AddTxModal';
import OCRModal from './components/OCRModal';
import BottomNavigation from './components/BottomNavigation';
import { Loader2, AlertCircle, Trash2, Plus, ArrowRight, Mail, User, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const appAnimationVariants = {
  loading: {
    filter: 'blur(16px)',
    scale: 0.98,
    opacity: 0.45,
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
  const { allUsers, switchGoogleUser, deleteUser, appName, appLogo, isLoading } = useApp();
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
  ];

  const handleCreateAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const selectedAvatar = avatar || PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    await switchGoogleUser(email.trim(), name.trim() || undefined, selectedAvatar);
    setEmail('');
    setName('');
    setAvatar('');
  };

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
              <span>Google Account Gateway</span>
            </p>
          </div>
        </div>

        {/* Saved Profiles Section */}
        <div className="bg-zinc-900/40 border border-zinc-850/80 p-6 rounded-3xl backdrop-blur-xl shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-zinc-200">Select Google Account</h2>
            <p className="text-[10px] text-zinc-500">Sign back in with saved profiles on this device</p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {allUsers.map((acc) => (
              <div 
                key={acc.id}
                className="group flex items-center justify-between p-3 rounded-2xl bg-zinc-950/20 border border-zinc-850 hover:border-zinc-700/60 transition-all hover:bg-zinc-900/30"
              >
                <button
                  onClick={() => switchGoogleUser(acc.email, acc.name, acc.avatarUrl)}
                  className="flex-1 text-left flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <img src={acc.avatarUrl || PRESET_AVATARS[0]} alt={acc.name} className="h-9 w-9 rounded-xl object-cover shrink-0 ring-1 ring-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-zinc-200 block truncate">{acc.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate block">{acc.email}</span>
                  </div>
                </button>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${acc.name}'s account and ALL associated ledger records permanently? This cannot be undone.`)) {
                      await deleteUser(acc.id);
                    }
                  }}
                  className="p-1.5 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shrink-0"
                  title="Remove account from device"
                >
                  <Trash2 size={13} className="stroke-[2.5]" />
                </button>
              </div>
            ))}

            {allUsers.length === 0 && (
              <div className="text-center py-6 text-xs text-zinc-500 italic">
                No active profiles found. Please sign in below.
              </div>
            )}
          </div>

          {/* Collapsible New User Form Trigger */}
          {!showNewUserForm ? (
            <button
              onClick={() => setShowNewUserForm(true)}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Sign In with another Google account</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndLogin} className="space-y-4 pt-3 border-t border-zinc-800/50 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Google Credentials</span>
                <button 
                  type="button" 
                  onClick={() => setShowNewUserForm(false)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-600" />
                  <input
                    type="email"
                    placeholder="google.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 placeholder-zinc-600"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Gautham K (Optional Name)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 placeholder-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Choose Google Avatar</label>
                  <div className="flex items-center gap-3">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`h-9 w-9 rounded-xl overflow-hidden cursor-pointer transition-all shrink-0 relative ${
                          avatar === av ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950' : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="Preset avatar" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/5 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>Authorize & Switch Account</span>
                <ArrowRight size={13} className="stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DashboardLayout() {
  const { activeView, isLoading, error, theme, activeUserId } = useApp();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  
  // Hold active transaction being edited
  const [editingTx, setEditingTx] = useState<any | null>(null);

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

  if (!activeUserId) {
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
      >
        
        {/* 1. Left Animated Collapsible Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* 2. Main Workspace Block */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
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

        {/* AI Receipt Scanner Modal */}
        <OCRModal 
          isOpen={ocrOpen} 
          onClose={() => setOcrOpen(false)} 
        />

        {/* Floating Glassmorphic Mobile Bottom Navigation */}
        <BottomNavigation onOpenAddTx={() => setAddTxOpen(true)} />

      </motion.div>

      {/* Cinematic Glassmorphic Loader Overlay */}
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
