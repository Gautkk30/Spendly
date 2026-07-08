import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Scan, Loader2, Sparkles, Check, Edit3, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OCRModal: React.FC<OCRModalProps> = ({ isOpen, onClose }) => {
  const { runOCR, addTransaction, wallets, categories } = useApp();

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
    // Validate is image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image receipt (PNG, JPG, or WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      
      // Start OCR
      await startOcrAnalysis(base64String);
    };
    reader.readAsDataURL(file);
  };

  const startOcrAnalysis = async (base64: string) => {
    setLoading(true);
    setExtractedData(null);
    
    // Animate loading stages
    const phases = [
      'Scanning receipt structure...',
      'De-skewing and optimizing contrast...',
      'Extracting merchant and purchase date...',
      'Identifying items and tallying final sum...',
      'Mapping Spendly intelligent category suggestion...'
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

  // Demo receipts helper so users can test immediately!
  const loadDemoReceipt = (demoNum: number) => {
    // Highly descriptive mock receipts
    let mockBase64 = '';
    let mockData: any = {};

    if (demoNum === 1) {
      // Starbucks
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
      // Amazon Prime
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
      // Chevron Gas
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
      setCategoryId(mockData.categorySuggestion);
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
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scan size={18} className="text-teal-400" />
                <span>AI Receipt Scanner</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Powered by Gemini</span>
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              
              {/* Left Column: Image Selector / Preview */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receipt Artifact</div>
                
                {!previewUrl && !loading ? (
                  <div 
                    onClick={triggerFileSelect}
                    className="flex-1 min-h-[300px] border border-dashed border-slate-800 hover:border-teal-500/30 bg-slate-950/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-slate-950/70 group"
                  >
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition-colors mb-4 shadow-inner">
                      <Upload size={22} />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">Drag & Drop receipt image</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP up to 8MB</span>
                    
                    <button className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors">
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
                  <div className="flex-1 min-h-[300px] bg-slate-950 rounded-2xl border border-slate-800/80 p-3 flex items-center justify-center relative overflow-hidden">
                    {previewUrl?.startsWith('data:') ? (
                      <img 
                        src={previewUrl} 
                        alt="Receipt receipt preview" 
                        className="max-h-[320px] object-contain rounded-lg shadow-2xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                        <ImageIcon size={44} className="text-teal-400/80 animate-pulse" />
                        <span className="text-xs">Receipt scanning simulated preview</span>
                      </div>
                    )}
                    
                    {!loading && (
                      <button 
                        onClick={() => { setPreviewUrl(null); setExtractedData(null); }}
                        className="absolute top-4 right-4 bg-slate-900/95 border border-slate-800 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-all shadow-xl"
                        title="Remove Receipt"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Demos Launcher */}
                {!loading && !extractedData && (
                  <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 block mb-2.5">TEST DEMO RECEIPTS IMMEDIATELY:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => loadDemoReceipt(1)}
                        className="py-2 px-3 text-xs bg-slate-900 border border-slate-850 hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 rounded-xl cursor-pointer transition-all truncate"
                      >
                        ☕ Starbucks ($14.85)
                      </button>
                      <button 
                        onClick={() => loadDemoReceipt(2)}
                        className="py-2 px-3 text-xs bg-slate-900 border border-slate-850 hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 rounded-xl cursor-pointer transition-all truncate"
                      >
                        📦 Amazon ($139.00)
                      </button>
                      <button 
                        onClick={() => loadDemoReceipt(3)}
                        className="py-2 px-3 text-xs bg-slate-900 border border-slate-850 hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 rounded-xl cursor-pointer transition-all truncate"
                      >
                        ⛽ Chevron ($58.40)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Loading Skeletons / Fields Verification */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Extracted Ledger Data</div>
                
                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/40 border border-slate-850 rounded-2xl text-center min-h-[350px]">
                    <div className="relative mb-6">
                      <Loader2 size={36} className="text-teal-400 animate-spin" />
                      <Sparkles size={16} className="text-emerald-400 absolute -top-1 -right-1 animate-ping" />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">AI extraction in progress</span>
                    <span className="text-xs text-slate-500 mt-1.5 max-w-xs">{loadingPhase}</span>
                    
                    {/* Animated visual progress nodes */}
                    <div className="flex gap-1.5 mt-5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce delay-100"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}

                {!loading && !extractedData && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 border border-slate-850 rounded-2xl text-center text-slate-500 min-h-[350px] bg-slate-950/10">
                    <Sparkles size={28} className="text-slate-600 mb-3" />
                    <span className="text-sm">Upload or choose a demo receipt to auto-populate the ledger details via artificial intelligence.</span>
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
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Merchant</label>
                      <input 
                        type="text"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>

                    {/* Amount & Tax side-by-side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount ($)</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tax Included ($)</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={tax}
                          onChange={(e) => setTax(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50 font-mono"
                        />
                      </div>
                    </div>

                    {/* Date field */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Date</label>
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>

                    {/* Category Selector (Pre-mapped by Gemini!) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category (AI Suggestion)</label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                        >
                          {categories.filter(c => c.type === 'expense').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination Wallet</label>
                        <select
                          value={walletId}
                          onChange={(e) => setWalletId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                        >
                          {wallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* AI metadata note */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Scan Metadata Note</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none focus:border-teal-500/50 resize-none leading-snug"
                      />
                    </div>

                    {/* Save Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setExtractedData(null); }}
                        className="flex-1 py-2.5 text-xs font-bold text-slate-400 border border-slate-800 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex-[2] py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
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
