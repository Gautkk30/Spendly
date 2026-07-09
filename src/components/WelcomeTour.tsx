import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Terminal, 
  Coins, 
  Compass, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  X,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ isOpen, onClose }) => {
  const { theme, setActiveView } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const tourSteps = [
    {
      title: 'Welcome to Spendly 🚀',
      description: 'Spendly is a high-performance, secure, multi-user wealth and ledger auditing suite. Let’s take a 60-second tour to master your workflow and unlock optimal SaaS bookkeeping productivity.',
      icon: Compass,
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
      action: () => {}
    },
    {
      title: 'Interactive Ledger & Core Dashboards',
      description: 'Check today’s active income, daily expense velocities, and monthly net surpluses. You can switch between views like Budgets (to establish safety spending guardrails) and Goals (to fulfill target savings projects).',
      icon: Terminal,
      color: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
      action: () => { setActiveView('dashboard'); }
    },
    {
      title: 'AI Receipt Invoice Scanner 🔮',
      description: 'Leverage deep OCR scanning to automatically extract merchant data, catalog itemizations, taxes, and values from physical receipts. Just drag-and-drop or snapshot a receipt inside the scanner.',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/5 border-purple-500/10',
      action: () => {}
    },
    {
      title: 'Global Command Palette & Shortcuts',
      description: 'Press "cmd+k" or "/" from anywhere to open the Global Command Palette. Instantly switch views, trigger OCR, search transactions, or use our "Transaction Quick Add" micro-form for lightning fast logging.',
      icon: Keyboard,
      color: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
      action: () => {}
    },
    {
      title: 'Ready for Liftoff! 🌟',
      description: 'Master keyboard shortcuts (N for New entry, R to run OCR, 1-6 to switch tabs) and explore custom visual themes in App Configurations. You are fully equipped to audit your finances like an institutional desk.',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
      action: () => {}
    }
  ];

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      tourSteps[nextIdx].action();
    } else {
      localStorage.setItem('spendly_tour_completed', 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      tourSteps[prevIdx].action();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop filter blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Guided card box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className={`w-full max-w-md rounded-2xl border p-6 relative z-10 shadow-2xl overflow-hidden ${
            isLight
              ? 'bg-white border-zinc-200 text-zinc-900'
              : 'bg-[#0f0f12] border-zinc-800 text-zinc-100'
          }`}
        >
          {/* Top Banner Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-600" />

          {/* Close Header Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
          >
            <X size={16} />
          </button>

          {/* Stepper Progress Icon */}
          <div className="mb-6 flex justify-start">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${step.color}`}>
              <StepIcon size={20} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Stepper Text Details */}
          <div className="space-y-2 mb-8 min-h-[140px]">
            <h2 className="text-lg font-black tracking-tight">
              {step.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              {step.description}
            </p>
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/60 pt-4">
            {/* Dots navigation indicators */}
            <div className="flex gap-1.5">
              {tourSteps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep 
                      ? 'w-5 bg-emerald-500' 
                      : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* CTA control actions */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
                    isLight 
                      ? 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600' 
                      : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1 transition-all"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
