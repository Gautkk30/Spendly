import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAManager: React.FC = () => {
  const { theme } = useApp();
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          // Check for waiting worker on page load
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdate(true);
          }

          // Listen for new service worker installation
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // A new service worker is installed and waiting to activate
                  setWaitingWorker(installingWorker);
                  setShowUpdate(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle controller change (reload the page with new service worker cache active)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Post SKIP_WAITING to service worker to trigger activation & reload
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          id="pwa-update-toast"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 pointer-events-auto"
        >
          <div className={`p-4 rounded-2xl border shadow-2xl flex flex-col gap-3 relative overflow-hidden ${
            isLight
              ? 'bg-white border-zinc-200 text-zinc-900'
              : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            {/* Top gradient glow decor */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-extrabold text-xs tracking-tight">Update Available</h4>
                <p className={`text-[11px] leading-relaxed mt-0.5 ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  A new version of Spendly is available with enhancements and performance upgrades.
                </p>
              </div>
              <button
                onClick={() => setShowUpdate(false)}
                className={`absolute top-3 right-3 p-1 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-zinc-500 hover:text-zinc-200'
                }`}
                title="Dismiss update notification"
              >
                <X size={13} className="stroke-[2.5]" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowUpdate(false)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                  isLight
                    ? 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                    : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Dismiss
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw size={11} className="animate-spin-slow" />
                <span>Update Now</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAManager;
