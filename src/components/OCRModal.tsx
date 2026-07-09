import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Scan, Loader2, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OCRModal: React.FC<OCRModalProps> = ({ isOpen, onClose }) => {
  const { runOCR, addTransaction, wallets, categories, theme } = useApp();

  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  
  // Edited form state
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [tax, setTax] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [note, setNote] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image receipt (PNG, JPG, or WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      await startOcrAnalysis(base64String);
    };
    reader.readAsDataURL(file);
  };

  const startOcrAnalysis = async (base64: string) => {
    setLoading(true);
    setExtractedData(null);
    
    const phases = [
      'Scanning receipt structure...',
      'De-skewing and optimizing contrast...',
      'Extracting merchant and purchase date...',
      'Identifying items and tallying final sum...',
      'Mapping Spendly category suggestion...'
    ];

    let currentPhase = 0;
    setLoadingPhase(phases[0]);
    const timer = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setLoadingPhase(phases[currentPhase]);
    }, 1500);

    try {
      const data = await runOCR(base64);
      clearInterval(timer);
      
      setExtractedData(data);
      setMerchant(data.merchant);
      setAmount(data.amount.toString());
      setDate(data.date);
      setTax(data.tax.toString());
      setCategoryId(data.categorySuggestion || categories.find(c => c.type === 'expense')?.id || '');
      setWalletId(wallets[0]?.id || '');
      setNote(data.note || '');
    } catch (e: any) {
      clearInterval(timer);
      alert('Failed to analyze receipt image: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoReceipt = (demoNum: number) => {
    let mockData: any = {};

    if (demoNum === 1) {
      mockData = {
        merchant: 'Starbucks Coffee #1052',
        amount: 14.85,
        date: new Date().toISOString().split('T')[0],
        tax: 1.25,
        categorySuggestion: 'cat-food',
        note: 'Extracted automatically from receipt. (OCR Demo - Starbucks)',
        tags: ['coffee', 'breakfast', 'ocr']
      };
    } else if (demoNum === 2) {
      mockData = {
        merchant: 'Amazon.com SVCS',
        amount: 139.00,
        date: '2026-07-06',
        tax: 11.50,
        categorySuggestion: 'cat-shopping',
        note: 'Extracted automatically from receipt. (OCR Demo - Amazon Prime)',
        tags: ['shopping', 'subscription', 'ocr']
      };
    } else {
      mockData = {
        merchant: 'Chevron Station 4059',
        amount: 58.40,
        date: '2026-07-07',
        tax: 4.80,
        categorySuggestion: 'cat-transport',
        note: 'Extracted automatically from receipt. (OCR Demo - Gas)',
        tags: ['fuel', 'commute', 'ocr']
      };
    }

    setPreviewUrl('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300');
    setLoading(true);
    setExtractedData(null);
    setLoadingPhase('Analyzing demo receipt with Gemini...');

    setTimeout(() => {
      setLoading(false);
      setExtractedData(mockData);
      setMerchant(mockData.merchant);
      setAmount(mockData.amount.toString());
      setDate(mockData.date);
      setTax(mockData.tax.toString());
      setCategoryId(mockData.categorySuggestion || categories.find(c => c.type === 'expense')?.id || '');
      setWalletId(wallets[0]?.id || '');
      setNote(mockData.note);
    }, 1200);
  };

  const handleSave = async () => {
    if (!merchant.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please fill in valid merchant name and amount.');
      return;
    }

    const payload = {
      walletId,
      categoryId,
      amount: Number(amount),
      type: 'expense' as const,
      date,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      tags: ['ocr', 'receipt'],
      isRecurring: false,
      ocrExtracted: true
    };

    await addTransaction(payload);
    onClose();
  };

  const isLight = theme === 'light';

  // Theme variable classes
  const modalBg = isLight ? 'bg-white border-zinc-200 shadow-xl' : 'bg-zinc-900 border-zinc-800/80 shadow-2xl';
  const textTitle = isLight ? 'text-zinc-900' : 'text-zinc-100';
  const textLabel = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const borderCol = isLight ? 'border-zinc-100' : 'border-zinc-800/60';
  const sectionBg = isLight ? 'bg-zinc-50/50 border border-zinc-200/80' : 'bg-zinc-950/40 border border-zinc-850/60';
  const inputStyle = isLight 
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all'
    : 'w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500/50 focus:bg-zinc-950 transition-all';
  const selectStyle = isLight
    ? 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 cursor-pointer'
    : 'w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500/50 cursor-pointer';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-4xl rounded-3xl overflow-hidden z-10 flex flex-col max-h-[90vh] border ${modalBg}`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${borderCol}`}>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                <Scan size={18} className="text-teal-500" />
                <span>AI Receipt Scanner</span>
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Powered by Gemini</span>
              </h2>
              <button 
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              
              {/* Left Column: Image Selector / Preview */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className={`text-xs font-bold uppercase tracking-wider ${textLabel}`}>Receipt Artifact</div>
                
                {!previewUrl && !loading ? (
                  <div 
                    onClick={triggerFileSelect}
                    className={`flex-1 min-h-[300px] border border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group ${
                      isLight 
                        ? 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/40 hover:bg-zinc-50/70' 
                        : 'border-zinc-850 hover:border-teal-500/30 bg-zinc-950/40 hover:bg-zinc-950/70'
                    }`}
                  >
                    <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center transition-colors mb-4 shadow-inner ${
                      isLight ? 'bg-white border-zinc-200 text-zinc-400 group-hover:text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-slate-400 group-hover:text-teal-400'
                    }`}>
                      <Upload size={22} />
                    </div>
                    <span className={`text-sm font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>Drag & Drop receipt image</span>
                    <span className="text-xs text-zinc-400 mt-1">PNG, JPG, or WEBP up to 8MB</span>
                    
                    <button className={`mt-4 px-4 py-2 text-xs font-semibold border rounded-xl transition-colors ${
                      isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}>
                      Browse Files
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
                ) : (
                  <div className={`flex-1 min-h-[300px] rounded-2xl p-3 flex items-center justify-center relative overflow-hidden border ${
                    isLight ? 'bg-zinc-50 border-zinc-200/80' : 'bg-zinc-950 border-zinc-800/80'
                  }`}>
                    {previewUrl?.startsWith('data:') ? (
                      <img 
                        src={previewUrl} 
                        alt="Receipt preview" 
                        className="max-h-[320px] object-contain rounded-lg shadow-2xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                        <ImageIcon size={44} className="text-teal-500 animate-pulse" />
                        <span className="text-xs">Receipt scanning preview</span>
                      </div>
                    )}
                    
                    {!loading && (
                      <button 
                        onClick={() => { setPreviewUrl(null); setExtractedData(null); }}
                        className={`absolute top-4 right-4 border p-2 rounded-xl cursor-pointer transition-all shadow-xl ${
                          isLight 
                            ? 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        title="Remove Receipt"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Demos Launcher */}
                {!loading && !extractedData && (
                  <div className={`p-4 rounded-2xl ${sectionBg}`}>
                    <span className={`text-xs font-bold block mb-2.5 ${textLabel}`}>TEST DEMO RECEIPTS IMMEDIATELY:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => loadDemoReceipt(1)}
                        className={`py-2 px-3 text-xs border rounded-xl cursor-pointer transition-all truncate font-semibold ${
                          isLight 
                            ? 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900' 
                            : 'bg-zinc-900 border-zinc-850 text-zinc-200 hover:border-emerald-500/20 hover:text-emerald-400'
                        }`}
                      >
                        ☕ Starbucks
                      </button>
                      <button 
                        onClick={() => loadDemoReceipt(2)}
                        className={`py-2 px-3 text-xs border rounded-xl cursor-pointer transition-all truncate font-semibold ${
                          isLight 
                            ? 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900' 
                            : 'bg-zinc-900 border-zinc-850 text-zinc-200 hover:border-emerald-500/20 hover:text-emerald-400'
                        }`}
                      >
                        📦 Amazon
                      </button>
                      <button 
                        onClick={() => loadDemoReceipt(3)}
                        className={`py-2 px-3 text-xs border rounded-xl cursor-pointer transition-all truncate font-semibold ${
                          isLight 
                            ? 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900' 
                            : 'bg-zinc-900 border-zinc-850 text-zinc-200 hover:border-emerald-500/20 hover:text-emerald-400'
                        }`}
                      >
                        ⛽ Chevron
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Loading Skeletons / Fields Verification */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textLabel}`}>Extracted Ledger Data</div>
                
                {loading && (
                  <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl text-center min-h-[350px] ${sectionBg}`}>
                    <div className="relative mb-6">
                      <Loader2 size={36} className="text-teal-500 animate-spin" />
                      <Sparkles size={16} className="text-emerald-500 absolute -top-1 -right-1 animate-ping" />
                    </div>
                    <span className={`font-semibold text-sm ${textTitle}`}>AI extraction in progress</span>
                    <span className="text-xs text-zinc-400 mt-1.5 max-w-xs">{loadingPhase}</span>
                    
                    <div className="flex gap-1.5 mt-5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce delay-100"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}

                {!loading && !extractedData && (
                  <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl text-center min-h-[350px] ${sectionBg}`}>
                    <Sparkles size={28} className="text-zinc-400 mb-3" />
                    <span className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                      Upload or choose a demo receipt to auto-populate the ledger details via artificial intelligence.
                    </span>
                  </div>
                )}

                {!loading && extractedData && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 space-y-4"
                  >
                    {/* Merchant field */}
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>Merchant</label>
                      <input 
                        type="text"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className={inputStyle}
                      />
                    </div>

                    {/* Amount & Tax side-by-side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>Total Amount</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>Tax Included</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={tax}
                          onChange={(e) => setTax(e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Date field */}
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>Purchase Date</label>
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputStyle}
                      />
                    </div>

                    {/* Category Selector (Pre-mapped by Gemini!) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>CategorySuggestion</label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className={selectStyle}
                        >
                          {categories.filter(c => c.type === 'expense').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>Destination Wallet</label>
                        <select
                          value={walletId}
                          onChange={(e) => setWalletId(e.target.value)}
                          className={selectStyle}
                        >
                          {wallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* AI metadata note */}
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textLabel}`}>Scan Metadata Note</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className={`w-full border rounded-xl px-4 py-2 text-xs resize-none leading-snug focus:outline-none ${
                          isLight 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-600 focus:border-zinc-400 focus:bg-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 focus:border-teal-500/50'
                        }`}
                      />
                    </div>

                    {/* Save Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setExtractedData(null); }}
                        className={`flex-1 py-2.5 text-xs font-bold border rounded-xl transition-colors cursor-pointer ${
                          isLight 
                            ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800' 
                            : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex-[2] py-2.5 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 text-white dark:text-zinc-950 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check size={14} className="stroke-[3]" />
                        <span>Log Transaction</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OCRModal;
