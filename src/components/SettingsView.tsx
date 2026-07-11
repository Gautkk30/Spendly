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
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { CURRENCIES, DEFAULT_AVATAR } from '../data/defaultData';
import { CurrencyCode } from '../types';

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
  const [activeTab, setActiveTab] = useState<'saas' | 'notifications' | 'security'>('saas');

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

  const THEME_PRESETS = [
    { id: 'light', name: 'Classic Light', desc: 'Squeaky clean light zinc layout', bg: 'bg-zinc-50', text: 'text-zinc-900', accent: 'bg-emerald-500' },
    { id: 'dark', name: 'Spendly Dark', desc: 'Sophisticated deep charcoal base', bg: 'bg-[#09090b]', text: 'text-zinc-100', accent: 'bg-emerald-400' },
    { id: 'midnight', name: 'Midnight Sapphire', desc: 'Cyberpunk deep navy blue canvas', bg: 'bg-[#0a0f1d]', text: 'text-zinc-100', accent: 'bg-blue-400' },
    { id: 'forest', name: 'Forest Zen', desc: 'Rich organic sage and pine aura', bg: 'bg-[#0c140f]', text: 'text-zinc-100', accent: 'bg-teal-400' },
    { id: 'sunset', name: 'Sunset Rose', desc: 'Warm auburn and crimson aesthetics', bg: 'bg-[#1a0e12]', text: 'text-zinc-100', accent: 'bg-rose-400' },
    { id: 'amethyst', name: 'Neon Amethyst', desc: 'Ethereal dark fuchsia and violet dream', bg: 'bg-[#110c1c]', text: 'text-zinc-100', accent: 'bg-purple-400' }
  ];

  const isLight = theme === 'light';

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
      if (user.appearanceSettings) {
        setStartupPin(user.appearanceSettings.startupPin ?? false);
      }
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
              onClick={() => setActiveTab('saas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                activeTab === 'saas'
                  ? isLight 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200/50' 
                    : 'bg-zinc-900 text-white border-zinc-800'
                  : isLight
                    ? 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100/50 hover:text-zinc-900'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <User size={14} className={activeTab === 'saas' ? (isLight ? 'text-zinc-700' : 'text-zinc-200') : 'text-zinc-400'} />
              <span>SaaS Configuration</span>
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
              <span>Notifications Alerts</span>
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
              <span>Security & Keyrings</span>
            </button>
          </div>
        </div>

        {/* Right Side: Dynamic Tab Panels */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'saas' && (
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
                  <span>Save Configuration</span>
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

        </div>

      </div>

    </motion.div>
  );
};

export default SettingsView;
