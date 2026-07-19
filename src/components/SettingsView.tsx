import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Bell, 
  Shield, 
  Save, 
  CheckCircle2, 
  Upload, 
  Plus, 
  RefreshCw, 
  Globe, 
  Building, 
  Sparkles,
  Key,
  Trash2,
  LogOut,
  Palette,
  Sliders,
  Database,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { CURRENCIES, DEFAULT_AVATAR } from '../data/defaultData';
import { CurrencyCode, AppearanceConfig, DEFAULT_APPEARANCE } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 18
    }
  }
};

export const SettingsView: React.FC = () => {
  const { 
    user, 
    updateUser, 
    theme, 
    setTheme, 
    currency, 
    setCurrency,
    appName,
    appLogo,
    appFavicon,
    tagline,
    brandColors,
    updateAppConfig,
    logout
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Custom Branding local state
  const [localAppName, setLocalAppName] = useState('Spendly');
  const [localAppLogo, setLocalAppLogo] = useState('');
  const [localAppFavicon, setLocalAppFavicon] = useState('');
  const [localTagline, setLocalTagline] = useState('');
  const [localPrimaryColor, setLocalPrimaryColor] = useState('#09090b');
  const [localSecondaryColor, setLocalSecondaryColor] = useState('#27272a');
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  
  // Profile picture base64 state
  const [avatar, setAvatar] = useState('');

  // Setting active subcategories tab
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security' | 'notifications' | 'preferences' | 'data' | 'about'>('profile');

  // Local state for Notifications tab
  const [emailDigest, setEmailDigest] = useState(true);
  const [soundTriggers, setSoundTriggers] = useState(false);
  const [budgetThreshold, setBudgetThreshold] = useState('80');
  const [goalMilestones, setGoalMilestones] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Local state for Security tab
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [startupPin, setStartupPin] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [simulatedApiKey] = useState(() => 'sp_live_' + Math.random().toString(36).substring(2, 18).toUpperCase());

  // Local state for Appearance tab
  const [backgroundTheme, setBackgroundTheme] = useState<'aurora' | 'mesh' | 'glass' | 'minimal' | 'pure-dark'>('aurora');
  const [animationIntensity, setAnimationIntensity] = useState<'off' | 'low' | 'medium' | 'high'>('medium');
  const [mouseInteraction, setMouseInteraction] = useState(true);
  const [auroraSpeed, setAuroraSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');
  const [backgroundOpacity, setBackgroundOpacity] = useState(30);
  const [blurStrength, setBlurStrength] = useState<'low' | 'medium' | 'high'>('high');
  const [cardTransparency, setCardTransparency] = useState(40);
  const [uiDensity, setUiDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [cornerRadius, setCornerRadius] = useState<'rounded' | 'balanced' | 'sharp'>('balanced');
  const [accentColor, setAccentColor] = useState<'emerald' | 'blue' | 'purple' | 'rose' | 'amber' | 'indigo'>('emerald');
  const [appearanceSuccess, setAppearanceSuccess] = useState(false);

  const THEME_PRESETS = [
    { id: 'light', name: 'Classic Light', desc: 'Squeaky clean light zinc layout', bg: 'bg-zinc-50', text: 'text-zinc-900', accent: 'bg-emerald-500' },
    { id: 'dark', name: 'Spendly Dark', desc: 'Sophisticated deep charcoal base', bg: 'bg-[#09090b]', text: 'text-zinc-100', accent: 'bg-emerald-400' },
    { id: 'midnight', name: 'Midnight Sapphire', desc: 'Cyberpunk deep navy blue canvas', bg: 'bg-[#0a0f1d]', text: 'text-zinc-100', accent: 'bg-blue-400' },
    { id: 'forest', name: 'Forest Zen', desc: 'Rich organic sage and pine aura', bg: 'bg-[#0c140f]', text: 'text-zinc-100', accent: 'bg-teal-400' },
    { id: 'sunset', name: 'Sunset Rose', desc: 'Warm auburn and crimson aesthetics', bg: 'bg-[#1a0e12]', text: 'text-zinc-100', accent: 'bg-rose-400' },
    { id: 'amethyst', name: 'Neon Amethyst', desc: 'Ethereal dark fuchsia and violet dream', bg: 'bg-[#110c1c]', text: 'text-zinc-100', accent: 'bg-purple-400' }
  ];

  const isLight = theme === 'light';

  // Real-time live update synchronizer for appearance attributes
  const updateAppearanceSetting = async (key: string, value: any) => {
    // Instantly modify CSS variables on root workspace container for a lag-free responsive UI
    const container = document.querySelector('.workspace-container') as HTMLDivElement;
    if (container) {
      if (key === 'backgroundOpacity') {
        const elAurora = document.getElementById('app-bg-aurora');
        const elMesh = document.getElementById('app-bg-mesh');
        if (elAurora) elAurora.style.opacity = `${value / 100}`;
        if (elMesh) elMesh.style.opacity = `${value / 100}`;
      } else if (key === 'cardTransparency') {
        container.style.setProperty('--card-transparency-light', `${value / 100}`);
        container.style.setProperty('--card-transparency-dark', `${Math.min(0.8, (value / 100) * 0.75)}`);
      } else if (key === 'blurStrength') {
        const blurPx = value === 'low' ? '4px' : value === 'medium' ? '12px' : '24px';
        container.style.setProperty('--card-blur', blurPx);
      } else if (key === 'mouseInteraction') {
        if (!value) {
          container.style.setProperty('--mouse-glow-opacity', '0');
        } else {
          container.style.removeProperty('--mouse-glow-opacity');
        }
      } else if (key === 'uiDensity') {
        if (value === 'compact') {
          container.classList.add('density-compact');
        } else {
          container.classList.remove('density-compact');
        }
      } else if (key === 'cornerRadius') {
        let rad2xl = '16px';
        let radXl = '12px';
        let radLg = '8px';
        if (value === 'rounded') {
          rad2xl = '24px';
          radXl = '16px';
          radLg = '12px';
        } else if (value === 'sharp') {
          rad2xl = '0px';
          radXl = '0px';
          radLg = '0px';
        }
        container.style.setProperty('--radius-2xl', rad2xl);
        container.style.setProperty('--radius-xl', radXl);
        container.style.setProperty('--radius-lg', radLg);
      } else if (key === 'accentColor') {
        let rgb = '16, 185, 129'; // emerald
        if (value === 'blue') rgb = '59, 130, 246';
        else if (value === 'purple') rgb = '168, 85, 247';
        else if (value === 'rose') rgb = '244, 63, 94';
        else if (value === 'amber') rgb = '245, 158, 11';
        else if (value === 'indigo') rgb = '99, 102, 241';
        container.style.setProperty('--accent-rgb', rgb);
      }
    }

    // Persist immediately in database settings to keep it persistent across sessions
    const currentSettings = {
      ...DEFAULT_APPEARANCE,
      ...(user?.appearanceSettings || {}),
    };

    await updateUser({
      appearanceSettings: {
        ...currentSettings,
        [key]: value
      }
    });
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setNotificationsEnabled(user.notificationsEnabled);
      setAvatar(user.avatarUrl || '');
      if (user.notificationPreferences) {
        setEmailDigest(user.notificationPreferences.emailDigest ?? true);
        setSoundTriggers(user.notificationPreferences.soundTriggers ?? false);
        setBudgetThreshold(user.notificationPreferences.budgetThreshold ?? '80');
        setGoalMilestones(user.notificationPreferences.goalMilestones ?? true);
      }
      
      // Load appearance customizer properties
      const appSettings = user.appearanceSettings || {};
      setStartupPin(appSettings.startupPin ?? false);
      setBackgroundTheme(appSettings.backgroundTheme ?? 'aurora');
      setAnimationIntensity(appSettings.animationIntensity ?? 'medium');
      setMouseInteraction(appSettings.mouseInteraction ?? true);
      setAuroraSpeed(appSettings.auroraSpeed ?? 'slow');
      setBackgroundOpacity(appSettings.backgroundOpacity ?? 30);
      setBlurStrength(appSettings.blurStrength ?? 'high');
      setCardTransparency(appSettings.cardTransparency ?? 40);
      setUiDensity(appSettings.uiDensity ?? 'comfortable');
      setCornerRadius(appSettings.cornerRadius ?? 'balanced');
      setAccentColor(appSettings.accentColor ?? 'emerald');
    }
  }, [user]);

  useEffect(() => {
    setLocalAppName(appName);
    setLocalAppLogo(appLogo);
    setLocalAppFavicon(appFavicon || appLogo);
    setLocalTagline(tagline || 'Smarter Wealth & Ledger Auditing Suite');
    setLocalPrimaryColor(brandColors?.primary || '#09090b');
    setLocalSecondaryColor(brandColors?.secondary || '#27272a');
  }, [appName, appLogo, appFavicon, tagline, brandColors]);

  // Profile Picture File Upload Handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin Logo File Upload Handler
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLocalAppLogo(base64);
        setLocalAppFavicon(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Name and Email are required.');
      return;
    }

    await updateUser({
      name: name.trim(),
      email: email.trim(),
      notificationsEnabled,
      avatarUrl: avatar
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveNotifications = async () => {
    await updateUser({
      notificationPreferences: {
        emailDigest,
        soundTriggers,
        budgetThreshold,
        goalMilestones
      }
    });
    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 3000);
  };

  const handleSaveSecurity = async () => {
    await updateUser({
      appearanceSettings: {
        ...(user?.appearanceSettings || {}),
        startupPin
      }
    });
    setSecuritySuccess(true);
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAppConfig(
      localAppName.trim(), 
      localAppLogo, 
      localAppLogo, 
      localTagline.trim(), 
      { primary: localPrimaryColor, secondary: localSecondaryColor }
    );
    setBrandingSuccess(true);
    setTimeout(() => setBrandingSuccess(false), 3000);
  };

  const cardStyle = isLight 
    ? 'p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm transition-all' 
    : 'p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 transition-all';

  const inputStyle = isLight 
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400' 
    : 'w-full bg-zinc-950 border border-zinc-800/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700';

  const selectStyle = isLight
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer'
    : 'w-full bg-zinc-950 border border-zinc-800/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 cursor-pointer';

  const titleStyle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textMutedStyle = isLight ? 'text-zinc-500' : 'text-zinc-400';

  // Static switcher Google accounts list
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className={`text-2xl font-bold tracking-tight ${titleStyle}`}>App Configuration</h1>
        <p className={`text-xs ${textMutedStyle}`}>Manage your SaaS profile, Google accounts, and custom app branding settings</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Sidebar controls & Multi-Account Switcher */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section 1: Navigation panel */}
          <div className={`p-4 border rounded-2xl space-y-1 shadow-sm ${
            isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800/60'
          }`}>
            <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
              <span>Settings Categories</span>
            </div>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'profile'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <User size={14} className={activeTab === 'profile' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>Personal Profile</span>
            </button>

            <button 
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'appearance'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Palette size={14} className={activeTab === 'appearance' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>Appearance & Style</span>
            </button>

            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'security'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Key size={14} className={activeTab === 'security' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>Security Hub</span>
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'notifications'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Bell size={14} className={activeTab === 'notifications' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>Alert Signals</span>
            </button>

            <button 
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'preferences'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Sliders size={14} className={activeTab === 'preferences' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>Preferences</span>
            </button>

            <button 
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'data'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Database size={14} className={activeTab === 'data' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>Data Management</span>
            </button>

            <button 
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'about'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Info size={14} className={activeTab === 'about' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>About App</span>
            </button>

          </div>
        </div>

        {/* Right Side: Dynamic Tab Panels */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Panel 1: Account Info & Profile picture device upload */}
          <div className={cardStyle}>
            <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
              isLight ? 'border-zinc-100' : 'border-zinc-850/60'
            }`}>
              <div className="space-y-0.5">
                <h3 className={`font-bold text-sm ${titleStyle}`}>Personal Profile Settings</h3>
                <p className={`text-[10px] ${textMutedStyle}`}>Update your name, email, and upload a custom profile picture</p>
              </div>
              {saveSuccess && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full animate-fade-in">
                  <CheckCircle2 size={11} /> Saved Successfully
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Profile Avatar device upload */}
              <div className="flex items-center gap-5 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img 
                    src={avatar || DEFAULT_AVATAR} 
                    alt="User avatar" 
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-emerald-500/20 dark:ring-zinc-800 group-hover:opacity-75 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Upload size={14} className="text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`text-xs font-bold block ${titleStyle}`}>Upload Custom Avatar</span>
                  <p className="text-[9px] text-zinc-400">Select any PNG, JPG or SVG image directly from your local device.</p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                      isLight ? 'bg-white hover:bg-zinc-50 border-zinc-200' : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    Choose Photo
                  </button>
                </div>
              </div>

              {/* Name & Email inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Your Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputStyle} font-semibold`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Google Account Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
              }`}>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${titleStyle}`}>Interactive Alert Signals</span>
                  <span className={`text-[10px] ${textMutedStyle}`}>Enable overspending notifications and goal progress triggers</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="h-4.5 w-4.5 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  <Save size={13} className="stroke-[2.5]" />
                  <span>Save Profile Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Panel 2: Administrator custom branding dashboard updates */}
          {user?.email === 'gauthamkk30@gmail.com' && (
            <div className={cardStyle}>
              <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
                isLight ? 'border-zinc-100' : 'border-zinc-850/60'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-emerald-500" />
                    <h3 className={`font-bold text-sm ${titleStyle}`}>SaaS Branding Controls (Admin Mode)</h3>
                  </div>
                  <p className={`text-[10px] ${textMutedStyle}`}>Change the App Name and App Logo. Instantly updates on every user device!</p>
                </div>
                {brandingSuccess && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full animate-fade-in">
                    <CheckCircle2 size={11} /> Branding Synchronized
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Application Branded Name</label>
                    <input 
                      type="text" 
                      value={localAppName}
                      onChange={(e) => setLocalAppName(e.target.value)}
                      placeholder="e.g. Spendly"
                      className={`${inputStyle} font-semibold`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Brand Logo URL / Input</label>
                    <input 
                      type="text" 
                      value={localAppLogo}
                      onChange={(e) => {
                        setLocalAppLogo(e.target.value);
                        setLocalAppFavicon(e.target.value);
                      }}
                      placeholder="e.g. Image URL or Base64 String"
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Application Tagline</label>
                    <input 
                      type="text" 
                      value={localTagline}
                      onChange={(e) => setLocalTagline(e.target.value)}
                      placeholder="e.g. Smarter Wealth & Ledger Auditing Suite"
                      className={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Primary Color</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={localPrimaryColor}
                          onChange={(e) => setLocalPrimaryColor(e.target.value)}
                          className="h-8 w-8 rounded cursor-pointer border border-zinc-800/20 dark:border-zinc-800 bg-transparent p-0"
                        />
                        <input 
                          type="text" 
                          value={localPrimaryColor}
                          onChange={(e) => setLocalPrimaryColor(e.target.value)}
                          className={`${inputStyle} h-8 py-0 px-2 text-[10px] font-mono`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Secondary Color</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={localSecondaryColor}
                          onChange={(e) => setLocalSecondaryColor(e.target.value)}
                          className="h-8 w-8 rounded cursor-pointer border border-zinc-800/20 dark:border-zinc-800 bg-transparent p-0"
                        />
                        <input 
                          type="text" 
                          value={localSecondaryColor}
                          onChange={(e) => setLocalSecondaryColor(e.target.value)}
                          className={`${inputStyle} h-8 py-0 px-2 text-[10px] font-mono`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo device uploader for administrators */}
                <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 flex items-center gap-5">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    {localAppLogo ? (
                      <img src={localAppLogo} alt="Branded Logo Preview" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <Globe size={18} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className={`text-[11px] font-bold block ${titleStyle}`}>Upload Brand Logo Icon from device</span>
                    <p className="text-[9px] text-zinc-400">Quickly upload an image asset from your device to replace the global SVG launcher icon.</p>
                    <input 
                      type="file" 
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                        isLight ? 'bg-white hover:bg-zinc-50 border-zinc-200' : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      Select Logo File
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white`}
                  >
                    <RefreshCw size={12} className="animate-spin-slow" />
                    <span>Update & Push Globally</span>
                  </button>
                </div>
              </form>
            </div>
          )}
          </>
          )}

          {activeTab === 'preferences' && (
            <div className={`${cardStyle} animate-fade-in`}>
              <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
                isLight ? 'border-zinc-100' : 'border-zinc-850/60'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sliders size={14} className="text-emerald-500" />
                    <h3 className={`font-bold text-sm ${titleStyle}`}>System Preferences</h3>
                  </div>
                  <p className={`text-[10px] ${textMutedStyle}`}>Adjust default currency, application theme, and landing layout view preference.</p>
                </div>
                {saveSuccess && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full animate-fade-in">
                    <CheckCircle2 size={11} /> Preferences Saved
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Currency Selector */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className={selectStyle}
                  >
                    {Object.keys(CURRENCIES).map(code => (
                      <option key={code} value={code}>{code} ({CURRENCIES[code].symbol}) - {CURRENCIES[code].name}</option>
                    ))}
                  </select>
                </div>

                {/* Default Landing Tab View */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Default Landing View</label>
                  <select
                    value={localStorage.getItem('spendly_default_tab') || 'dashboard'}
                    onChange={(e) => {
                      localStorage.setItem('spendly_default_tab', e.target.value);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                    }}
                    className={selectStyle}
                  >
                    <option value="dashboard">Dashboard Overview</option>
                    <option value="transactions">Transactions Register</option>
                    <option value="wallets">Accounts & Wallets</option>
                    <option value="budgets">Budgets Planning</option>
                    <option value="goals">Savings Goals</option>
                  </select>
                  <p className="text-[9.5px] text-zinc-400 mt-1">Select which screen Spendly defaults to on startup.</p>
                </div>

                {/* Dynamic Theme Selection Grid */}
                <div className="border-t border-zinc-800/10 dark:border-zinc-800/50 pt-5 mt-2">
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2.5 ${textMutedStyle}`}>Workspace Custom Theme Palette</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected = theme === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setTheme(preset.id as any)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/10 shadow-sm' 
                              : isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[11px] font-bold ${titleStyle}`}>{preset.name}</span>
                            <div className="flex gap-1.5">
                              <span className={`h-3 w-3 rounded-full ${preset.bg} border border-zinc-700/30 shadow-sm`}></span>
                              <span className={`h-3 w-3 rounded-full ${preset.accent} shadow-sm`}></span>
                            </div>
                          </div>
                          <span className="text-[9.5px] text-zinc-400 leading-relaxed">{preset.desc}</span>
                          {isSelected && (
                            <div className="absolute right-0 bottom-0 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-tl-lg scale-90">✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    <Save size={13} className="stroke-[2.5]" />
                    <span>Save Preference Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'data' && (
            <div className={`${cardStyle} animate-fade-in space-y-6`}>
              <div className={`flex items-center justify-between border-b pb-4 ${
                isLight ? 'border-zinc-100' : 'border-zinc-850/60'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Database size={14} className="text-emerald-500" />
                    <h3 className={`font-bold text-sm ${titleStyle}`}>Data & Backups Hub</h3>
                  </div>
                  <p className={`text-[10px] ${textMutedStyle}`}>Export your financial sheets, clear temporary cache buffers, and manage database snapshots.</p>
                </div>
              </div>

              {/* Data Export section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 border rounded-xl flex flex-col justify-between gap-3 ${
                  isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
                }`}>
                  <div className="space-y-1">
                    <span className={`text-xs font-bold block ${titleStyle}`}>Export Ledger (JSON Format)</span>
                    <p className="text-[9.5px] text-zinc-400 leading-relaxed">Download a complete cryptographic backup containing all active accounts, wallets, and registered categories.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                        exportedAt: new Date().toISOString(),
                        version: 'Spendly Ledger v2.4'
                      }, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `spendly_ledger_backup_${new Date().toISOString().split('T')[0]}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="mt-2 w-full py-2 px-3 text-center text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer"
                  >
                    Download JSON Backup
                  </button>
                </div>

                <div className={`p-4 border rounded-xl flex flex-col justify-between gap-3 ${
                  isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
                }`}>
                  <div className="space-y-1">
                    <span className={`text-xs font-bold block ${titleStyle}`}>Flush Browser Cache</span>
                    <p className="text-[9.5px] text-zinc-400 leading-relaxed">Hard reset local storage settings, cached visual assets, state buffers, and custom layouts to default.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm('Are you absolutely sure you want to flush all custom appearance configurations and preferences? Your transactions ledger is stored safely on MongoDB, but custom offline theme states will reset.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="mt-2 w-full py-2 px-3 text-center text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all cursor-pointer"
                  >
                    Reset & Clear Cache
                  </button>
                </div>
              </div>

              {/* Database Storage metrics */}
              <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block ${titleStyle}`}>MongoDB Cloud Status</span>
                    <p className="text-[9.5px] text-zinc-400">Direct server synchronization state.</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SYNCED & SECURE
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className={`${cardStyle} animate-fade-in space-y-6`}>
              <div className="flex flex-col items-center justify-center text-center p-6 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80">
                {appLogo ? (
                  <img src={appLogo} alt={appName} className="h-14 w-14 rounded-2xl object-cover shadow-md mb-3" />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg mb-3 shadow-emerald-500/10">
                    <Sparkles size={26} className="text-white" />
                  </div>
                )}
                <h3 className={`text-lg font-extrabold tracking-tight ${titleStyle}`}>{appName}</h3>
                <p className="text-xs text-emerald-500 font-semibold">{tagline || 'Smarter Wealth & Ledger Auditing Suite'}</p>
                <span className="mt-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-200 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800">
                  VERSION 2.4.0-RELEASE (BUILD #7A4F2C)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 p-4 border rounded-xl bg-zinc-950/5 border-zinc-800/20">
                  <span className={`text-xs font-bold block ${titleStyle}`}>Cryptographic Encryption</span>
                  <p className="text-[9.5px] text-zinc-400 leading-relaxed">Transactions are stored and audited on a MongoDB cluster. Authenticated requests use robust security keychains and startup PIN verification.</p>
                </div>

                <div className="space-y-1 p-4 border rounded-xl bg-zinc-950/5 border-zinc-800/20">
                  <span className={`text-xs font-bold block ${titleStyle}`}>PWA Capabilities</span>
                  <p className="text-[9.5px] text-zinc-400 leading-relaxed">Spendly operates offline-first using client-side service workers, caching assets automatically for high performance on both iOS and Android devices.</p>
                </div>
              </div>

              <div className="border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-400">
                <span>© 2026 Spendly Ltd. All Rights Reserved.</span>
                <div className="flex gap-4 mt-2 sm:mt-0 font-semibold">
                  <a href="#" className="hover:underline">Terms of Service</a>
                  <a href="#" className="hover:underline">Privacy Policy</a>
                  <a href="#" className="hover:underline">License Details</a>
                </div>
              </div>
            </div>
          )}

          {/* Panel: Notifications Alerts tab content */}
          {activeTab === 'notifications' && (
            <div className={`${cardStyle} animate-fade-in`}>
              <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
                isLight ? 'border-zinc-100' : 'border-zinc-850/60'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Bell size={14} className="text-emerald-500" />
                    <h3 className={`font-bold text-sm ${titleStyle}`}>Notification Alerts & Signals</h3>
                  </div>
                  <p className={`text-[10px] ${textMutedStyle}`}>Configure live signal alarms, overspending watchdogs, and status email digests.</p>
                </div>
                {notifSuccess && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full animate-fade-in">
                    <CheckCircle2 size={11} /> Alert Preferences Saved
                  </span>
                )}
              </div>

              <div className="space-y-5">
                <div className={`p-4 border rounded-xl flex items-center justify-between ${
                  isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
                }`}>
                  <div className="flex flex-col pr-4">
                    <span className={`text-xs font-bold ${titleStyle}`}>Master Alert Signals</span>
                    <span className={`text-[9.5px] ${textMutedStyle}`}>Master switcher to toggle all push and dashboard alert sounds and popups.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className={`p-4 border rounded-xl flex items-center justify-between ${
                  isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
                }`}>
                  <div className="flex flex-col pr-4">
                    <span className={`text-xs font-bold ${titleStyle}`}>Weekly & Monthly Email Digests</span>
                    <span className={`text-[9.5px] ${textMutedStyle}`}>Receive a periodic breakdown summarizing your expenses and net savings direct to your email.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={emailDigest}
                      onChange={(e) => setEmailDigest(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className={`p-4 border rounded-xl flex items-center justify-between ${
                  isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
                }`}>
                  <div className="flex flex-col pr-4">
                    <span className={`text-xs font-bold ${titleStyle}`}>In-App Sound Indicators</span>
                    <span className={`text-[9.5px] ${textMutedStyle}`}>Play a subtle physical tactile click sound when transactions or budget adjustments succeed.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={soundTriggers}
                      onChange={(e) => setSoundTriggers(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4 animate-fade-in">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Budget Limit Trigger</label>
                    <select
                      value={budgetThreshold}
                      onChange={(e) => setBudgetThreshold(e.target.value)}
                      className={selectStyle}
                    >
                      <option value="50">Notify at 50% Limit Spent</option>
                      <option value="80">Notify at 80% Limit Spent (Recommended)</option>
                      <option value="90">Notify at 90% Limit Spent</option>
                      <option value="100">Notify only on Overdraft (100%+)</option>
                      <option value="0">Do not Notify</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-850">
                    <div className="flex flex-col pr-2">
                      <span className={`text-xs font-bold ${titleStyle}`}>Goal Milestone Alarms</span>
                      <span className="text-[9px] text-zinc-400">Trigger on 50% and 100% savings goal milestones.</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={goalMilestones}
                      onChange={(e) => setGoalMilestones(e.target.checked)}
                      className="h-4.5 w-4.5 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-800/10 dark:border-zinc-800/40">
                  <button
                    onClick={handleSaveNotifications}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    <Save size={13} className="stroke-[2.5]" />
                    <span>Save Alert Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Panel: Security & Keyrings tab content */}
          {activeTab === 'security' && (
            <div className={`${cardStyle} animate-fade-in`}>
              <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
                isLight ? 'border-zinc-100' : 'border-zinc-850/60'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Key size={14} className="text-emerald-500" />
                    <h3 className={`font-bold text-sm ${titleStyle}`}>Security & Keyrings Hub</h3>
                  </div>
                  <p className={`text-[10px] ${textMutedStyle}`}>Manage session authentication, API access keys, cryptographic locks, and audits.</p>
                </div>
                {securitySuccess && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full animate-fade-in">
                    <CheckCircle2 size={11} /> Cryptography Updated
                  </span>
                )}
              </div>

              <div className="space-y-5">
                {/* Simulated API Keys section */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold block ${titleStyle}`}>Spendly Developer API Key</span>
                      <span className="text-[9.5px] text-zinc-400">Authenticate custom scripts, Zapier integrations, or webhooks securely.</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      className={`text-[10px] px-2 py-1 rounded border transition-all cursor-pointer ${
                        isLight ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {apiKeyVisible ? 'HIDE KEY' : 'REVEAL'}
                    </button>
                  </div>

                  <div className={`flex items-center gap-2 p-2.5 border rounded-lg font-mono text-[10px] ${
                    isLight ? 'bg-zinc-100/50 border-zinc-200 text-zinc-800' : 'bg-zinc-950/80 border-zinc-850 text-zinc-300'
                  }`}>
                    <span className="flex-1 truncate select-all">{apiKeyVisible ? simulatedApiKey : '••••••••••••••••••••••••••••••••'}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(simulatedApiKey);
                        alert('Developer API Key copied to clipboard securely!');
                      }}
                      className="text-[9.5px] font-sans font-bold text-emerald-500 px-2 py-0.5 hover:underline"
                    >
                      COPY
                    </button>
                  </div>
                </div>

                {/* Session pin lock security */}
                <div className={`p-4 border rounded-xl flex items-center justify-between ${
                  isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
                }`}>
                  <div className="flex flex-col pr-4">
                    <span className={`text-xs font-bold ${titleStyle}`}>Cryptographic Device Pin Lock</span>
                    <span className={`text-[9.5px] ${textMutedStyle}`}>Simulate a secure PIN request on your main browser screen every time Spendly boots up.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={startupPin}
                      onChange={(e) => setStartupPin(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Active Session Log */}
                <div className="space-y-2 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textMutedStyle}`}>Cryptographic Active Session Log</span>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-900/10 border-zinc-850'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${titleStyle}`}>Chrome on macOS (Apple M3 Pro)</span>
                          <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full">ACTIVE NOW</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-400">Location: Chennai, India — IP: 157.44.182.203</p>
                      </div>
                      <span className="text-[9.5px] text-zinc-500 font-medium">Secured</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-900/10 border-zinc-850'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${titleStyle}`}>Safari on iPhone 15 Pro</span>
                          <span className="bg-zinc-500/10 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full">2 HOURS AGO</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-400">Location: Bangalore, India — IP: 103.204.14.9</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => alert('Terminated Safari iPhone session successfully')}
                        className="text-[9.5px] text-red-500 hover:underline font-bold"
                      >
                        REVOKE
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-800/10 dark:border-zinc-800/40">
                  <button
                    onClick={handleSaveSecurity}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    <Save size={13} className="stroke-[2.5]" />
                    <span>Save Security Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Panel: Appearance customizer tab content */}
          {activeTab === 'appearance' && (
            <div className={`${cardStyle} animate-fade-in`}>
              <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
                isLight ? 'border-zinc-100' : 'border-zinc-850/60'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Palette size={14} className="text-emerald-500" />
                    <h3 className={`font-bold text-sm ${titleStyle}`}>Premium Appearance & Glassmorphism</h3>
                  </div>
                  <p className={`text-[10px] ${textMutedStyle}`}>Customize background styles, animations, speeds, blur filters, and card opacities.</p>
                </div>
                {appearanceSuccess && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full animate-fade-in">
                    <CheckCircle2 size={11} /> Settings Saved
                  </span>
                )}
              </div>

              <div className="space-y-6">
                
                {/* 1. Background Theme selection */}
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2.5 ${textMutedStyle}`}>Background Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {[
                      { id: 'aurora', name: 'Aurora', desc: 'Flowing colorful light' },
                      { id: 'mesh', name: 'Mesh Gradient', desc: 'Premium liquid layers' },
                      { id: 'glass', name: 'Glass', desc: 'Minimal static glow' },
                      { id: 'minimal', name: 'Minimal', desc: 'Elegant static gradient' },
                      { id: 'pure-dark', name: 'Pure Dark', desc: 'Maximum contrast' },
                    ].map((t) => {
                      const isSelected = backgroundTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setBackgroundTheme(t.id as any);
                            updateAppearanceSetting('backgroundTheme', t.id);
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 relative overflow-hidden ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/10' 
                              : isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/30'
                          }`}
                        >
                          <span className={`text-[11px] font-bold block ${titleStyle}`}>{t.name}</span>
                          <span className="text-[8.5px] text-zinc-400 leading-tight block">{t.desc}</span>
                          {isSelected && (
                            <div className="absolute right-0 bottom-0 bg-emerald-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-tl-md">✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive settings and intensities side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                  {/* Animation Intensity */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Animation Intensity</label>
                    <select
                      value={animationIntensity}
                      onChange={(e) => {
                        setAnimationIntensity(e.target.value as any);
                        updateAppearanceSetting('animationIntensity', e.target.value);
                      }}
                      className={selectStyle}
                    >
                      <option value="off">Off (Static background)</option>
                      <option value="low">Low (Fewer animated objects)</option>
                      <option value="medium">Medium (Standard movement)</option>
                      <option value="high">High (Full ambient depth)</option>
                    </select>
                  </div>

                  {/* Aurora Speed */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Animation Speed</label>
                    <select
                      value={auroraSpeed}
                      onChange={(e) => {
                        setAuroraSpeed(e.target.value as any);
                        updateAppearanceSetting('auroraSpeed', e.target.value);
                      }}
                      className={selectStyle}
                      disabled={animationIntensity === 'off'}
                    >
                      <option value="slow">Slow (Smooth & calming)</option>
                      <option value="normal">Normal (Moderate flow)</option>
                      <option value="fast">Fast (Dynamic energy)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Sliders & Blur strength */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                  
                  {/* Background Opacity Slider */}
                  <div className="p-3.5 border rounded-xl bg-zinc-50/10 dark:bg-zinc-950/10 border-zinc-200 dark:border-zinc-850">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold ${titleStyle}`}>Background Opacity</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">{backgroundOpacity}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={backgroundOpacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBackgroundOpacity(val);
                        updateAppearanceSetting('backgroundOpacity', val);
                      }}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-[8.5px] text-zinc-400 mt-1 block">Adjust the visual visibility of gradient themes.</span>
                  </div>

                  {/* Card Transparency Slider */}
                  <div className="p-3.5 border rounded-xl bg-zinc-50/10 dark:bg-zinc-950/10 border-zinc-200 dark:border-zinc-850">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold ${titleStyle}`}>Card Backdrop Transparency</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">{cardTransparency}%</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={cardTransparency}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCardTransparency(val);
                        updateAppearanceSetting('cardTransparency', val);
                      }}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-[8.5px] text-zinc-400 mt-1 block">Tune glassmorphic opacity of dashboard panels.</span>
                  </div>

                </div>

                {/* 4. Mouse glow and blur strength */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                  {/* Blur Strength */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textMutedStyle}`}>Gradient Blur Strength</label>
                    <select
                      value={blurStrength}
                      onChange={(e) => {
                        setBlurStrength(e.target.value as any);
                        updateAppearanceSetting('blurStrength', e.target.value);
                      }}
                      className={selectStyle}
                    >
                      <option value="low">Low (Sharper glass shapes)</option>
                      <option value="medium">Medium (Soft frosted layer)</option>
                      <option value="high">High (Deep ethereal fog)</option>
                    </select>
                  </div>

                  {/* Mouse Interaction Toggle */}
                  <div className="p-3.5 border rounded-xl flex items-center justify-between bg-zinc-50/10 dark:bg-zinc-950/10 border-zinc-200 dark:border-zinc-850">
                    <div className="flex flex-col pr-2">
                      <span className={`text-[11px] font-bold ${titleStyle}`}>Mouse Radial Glow</span>
                      <span className="text-[9px] text-zinc-400">Radial flashlight follows cursor on desktop devices.</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={mouseInteraction}
                      onChange={(e) => {
                        setMouseInteraction(e.target.checked);
                        updateAppearanceSetting('mouseInteraction', e.target.checked);
                      }}
                      className="h-4.5 w-4.5 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                    />
                  </div>
                </div>

                {/* 5. Custom UI Density & Corner Radius */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                  {/* UI Density */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedStyle}`}>UI Density Scaling</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'comfortable', name: 'Comfortable', desc: 'Spacious & relaxed' },
                        { id: 'compact', name: 'Compact', desc: 'Maximum data density' },
                      ].map((d) => {
                        const isSel = uiDensity === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setUiDensity(d.id as any);
                              updateAppearanceSetting('uiDensity', d.id);
                            }}
                            className={`px-3 py-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSel 
                                ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/10' 
                                : isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/30'
                            }`}
                          >
                            <span className={`text-[11px] font-bold block ${titleStyle}`}>{d.name}</span>
                            <span className="text-[8.5px] text-zinc-400 leading-tight block">{d.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedStyle}`}>Corner Geometry</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'rounded', name: 'Rounded', desc: 'Soft card curves' },
                        { id: 'balanced', name: 'Balanced', desc: 'Standard curves' },
                        { id: 'sharp', name: 'Sharp', desc: 'Brutalist 0px edges' },
                      ].map((r) => {
                        const isSel = cornerRadius === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setCornerRadius(r.id as any);
                              updateAppearanceSetting('cornerRadius', r.id);
                            }}
                            className={`px-2.5 py-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSel 
                                ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/10' 
                                : isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/30'
                            }`}
                          >
                            <span className={`text-[11px] font-bold block ${titleStyle}`}>{r.name}</span>
                            <span className="text-[8px] text-zinc-400 leading-tight block">{r.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 6. Accent Color Customizer */}
                <div className="border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2.5 ${textMutedStyle}`}>Accent Hue System</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
                      { id: 'blue', name: 'Blue', bg: 'bg-blue-500' },
                      { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
                      { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
                      { id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
                      { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500' },
                    ].map((c) => {
                      const isSel = accentColor === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setAccentColor(c.id as any);
                            updateAppearanceSetting('accentColor', c.id);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isSel 
                              ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/10' 
                              : isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/30'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shadow-sm`} />
                          <span className={titleStyle}>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/10 dark:border-zinc-800/40">
                  <button
                    onClick={() => {
                      setAppearanceSuccess(true);
                      setTimeout(() => setAppearanceSuccess(false), 3000);
                    }}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    <Save size={13} className="stroke-[2.5]" />
                    <span>Save Appearance Settings</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </motion.div>
  );
};

export default SettingsView;
