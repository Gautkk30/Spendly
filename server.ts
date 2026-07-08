import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Increase payload limit for receipt images
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ==========================================
// API ROUTES
// ==========================================

// Helper to get active user ID from request headers
const getRequestUserId = (req: express.Request) => {
  return (req.headers['x-user-id'] || 'usr-101') as string;
};

// Brand Customization Config Endpoints
app.get('/api/config', (req, res) => {
  res.json(db.getAppConfig());
});

app.put('/api/config', (req, res) => {
  const { appName, appLogo } = req.body;
  if (!appName) {
    return res.status(400).json({ error: 'appName is required' });
  }
  const updated = db.updateAppConfig({ appName, appLogo: appLogo || '' });
  res.json(updated);
});

// Simulated Google OAuth login endpoints
app.post('/api/auth/google/login', (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }
  const loggedInUser = db.getOrCreateUserByEmail(email, name, avatarUrl);
  res.json(loggedInUser);
});

app.post('/api/auth/google/restore', (req, res) => {
  const { userId, payload } = req.body;
  if (!userId || !payload) {
    return res.status(400).json({ error: 'userId and payload are required' });
  }
  db.restoreUserData(userId, payload);
  res.json({ success: true });
});

// 1. User Endpoints
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.delete('/api/users/:id', (req, res) => {
  const success = db.deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true });
});

app.get('/api/user', (req, res) => {
  res.json(db.getUser(getRequestUserId(req)));
});

app.put('/api/user', (req, res) => {
  const updated = db.updateUser(getRequestUserId(req), req.body);
  res.json(updated);
});

// 2. Wallet Endpoints
app.get('/api/wallets', (req, res) => {
  res.json(db.getWallets(getRequestUserId(req)));
});

app.post('/api/wallets', (req, res) => {
  const { name, balance, type, currency } = req.body;
  if (!name || balance === undefined || !type || !currency) {
    return res.status(400).json({ error: 'Missing required wallet fields' });
  }
  const newWallet = db.addWallet(getRequestUserId(req), {
    id: `w-${Date.now()}`,
    name,
    balance: Number(balance),
    type,
    currency
  });
  res.status(201).json(newWallet);
});

app.put('/api/wallets/:id', (req, res) => {
  const updated = db.updateWallet(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Wallet not found' });
  res.json(updated);
});

app.delete('/api/wallets/:id', (req, res) => {
  const success = db.deleteWallet(req.params.id);
  if (!success) return res.status(404).json({ error: 'Wallet not found' });
  res.json({ success: true });
});

// 3. Category Endpoints
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

app.post('/api/categories', (req, res) => {
  const { name, icon, color, type } = req.body;
  if (!name || !icon || !color || !type) {
    return res.status(400).json({ error: 'Missing required category fields' });
  }
  const newCategory = db.addCategory({
    id: `cat-${Date.now()}`,
    name,
    icon,
    color,
    type,
    isCustom: true
  });
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// 4. Transaction Endpoints
app.get('/api/transactions', (req, res) => {
  res.json(db.getTransactions(getRequestUserId(req)));
});

app.post('/api/transactions', (req, res) => {
  const { walletId, categoryId, amount, type, date, merchant, note, tags, isRecurring, recurringInterval, ocrExtracted } = req.body;
  if (!walletId || !categoryId || amount === undefined || !type || !date || !merchant) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }
  const newTx = db.addTransaction(getRequestUserId(req), {
    id: `tx-${Date.now()}`,
    walletId,
    categoryId,
    amount: Number(amount),
    type,
    date,
    merchant,
    note,
    tags: tags || [],
    isRecurring: !!isRecurring,
    recurringInterval,
    ocrExtracted: !!ocrExtracted
  });
  res.status(201).json(newTx);
});

app.put('/api/transactions/:id', (req, res) => {
  const updated = db.updateTransaction(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Transaction not found' });
  res.json(updated);
});

app.delete('/api/transactions/:id', (req, res) => {
  const success = db.deleteTransaction(req.params.id);
  if (!success) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

// Bulk Transaction Deletion
app.post('/api/transactions/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid or missing transaction IDs' });
  }
  let count = 0;
  ids.forEach(id => {
    if (db.deleteTransaction(id)) {
      count++;
    }
  });
  res.json({ success: true, deletedCount: count });
});

// 5. Budget Endpoints
app.get('/api/budgets', (req, res) => {
  res.json(db.getBudgets(getRequestUserId(req)));
});

app.post('/api/budgets', (req, res) => {
  const { categoryId, amount, period } = req.body;
  if (!categoryId || amount === undefined || !period) {
    return res.status(400).json({ error: 'Missing required budget fields' });
  }
  const now = new Date();
  const newBudget = db.addBudget(getRequestUserId(req), {
    id: `b-${Date.now()}`,
    categoryId,
    amount: Number(amount),
    spent: 0,
    period,
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });
  res.status(201).json(newBudget);
});

app.delete('/api/budgets/:id', (req, res) => {
  const success = db.deleteBudget(req.params.id);
  if (!success) return res.status(404).json({ error: 'Budget not found' });
  res.json({ success: true });
});

// 6. Goal Endpoints
app.get('/api/goals', (req, res) => {
  res.json(db.getGoals(getRequestUserId(req)));
});

app.post('/api/goals', (req, res) => {
  const { name, targetAmount, currentAmount, category, deadline } = req.body;
  if (!name || targetAmount === undefined || currentAmount === undefined || !category || !deadline) {
    return res.status(400).json({ error: 'Missing required goal fields' });
  }
  const newGoal = db.addGoal(getRequestUserId(req), {
    id: `g-${Date.now()}`,
    name,
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount),
    category,
    deadline
  });
  res.status(201).json(newGoal);
});

app.put('/api/goals/:id', (req, res) => {
  const updated = db.updateGoal(getRequestUserId(req), req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Goal not found' });
  res.json(updated);
});

app.delete('/api/goals/:id', (req, res) => {
  const success = db.deleteGoal(req.params.id);
  if (!success) return res.status(404).json({ error: 'Goal not found' });
  res.json({ success: true });
});

// 7. Notification Endpoints
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications(getRequestUserId(req)));
});

app.put('/api/notifications/:id/read', (req, res) => {
  const success = db.markNotificationRead(req.params.id);
  if (!success) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true });
});

app.delete('/api/notifications', (req, res) => {
  db.clearAllNotifications(getRequestUserId(req));
  res.json({ success: true });
});

// 8. Receipt OCR Endpoint (AI-powered with Gemini!)
app.post('/api/ocr', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing receipt image data (base64)' });
  }

  // Remove data URI prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  if (!ai) {
    // Return mock OCR if API key is not configured yet
    console.warn('GEMINI_API_KEY is not defined. Returning highly realistic mock OCR data.');
    return res.json({
      merchant: 'Target Stores',
      amount: 47.85,
      date: new Date().toISOString().split('T')[0],
      tax: 3.82,
      categorySuggestion: 'cat-shopping',
      note: 'Extracted automatically from receipt. (OCR Demo Mode)',
      tags: ['shopping', 'ocr']
    });
  }

  try {
    const prompt = `Analyze this receipt image and extract the following fields exactly:
    - Merchant/Store Name
    - Total Amount
    - Date of purchase (formatted as YYYY-MM-DD, default to current date if not found)
    - Tax amount (if listed, otherwise 0)
    - Category suggestion from this list: Food & Dining, Rent & Housing, Transportation, Shopping, Utilities & Bills, Entertainment, Healthcare, Travel, Miscellaneous. Pick the closest one.
    
    Return the output strictly in JSON format matching the schema provided.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING, description: 'The merchant name' },
            amount: { type: Type.NUMBER, description: 'The total amount paid' },
            date: { type: Type.STRING, description: 'Date of the purchase (YYYY-MM-DD)' },
            tax: { type: Type.NUMBER, description: 'The sales tax amount' },
            categorySuggestion: { 
              type: Type.STRING, 
              description: 'One of: Food & Dining, Rent & Housing, Transportation, Shopping, Utilities & Bills, Entertainment, Healthcare, Travel, Miscellaneous' 
            }
          },
          required: ['merchant', 'amount', 'date']
        }
      }
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);

    // Map the string category to a category ID
    let categoryId = 'cat-misc';
    const catMap: Record<string, string> = {
      'Food & Dining': 'cat-food',
      'Rent & Housing': 'cat-housing',
      'Transportation': 'cat-transport',
      'Shopping': 'cat-shopping',
      'Utilities & Bills': 'cat-utilities',
      'Entertainment': 'cat-entertainment',
      'Healthcare': 'cat-healthcare',
      'Travel': 'cat-travel',
      'Miscellaneous': 'cat-misc'
    };
    if (parsed.categorySuggestion && catMap[parsed.categorySuggestion]) {
      categoryId = catMap[parsed.categorySuggestion];
    }

    res.json({
      merchant: parsed.merchant || 'Unknown Merchant',
      amount: parsed.amount || 0,
      date: parsed.date || new Date().toISOString().split('T')[0],
      tax: parsed.tax || 0,
      categorySuggestion: categoryId,
      note: 'Extracted automatically from receipt via Gemini OCR.',
      tags: ['ocr', 'receipt']
    });
  } catch (error: any) {
    console.error('OCR processing error:', error);
    res.status(500).json({ error: 'Failed to process receipt image via Gemini API: ' + error.message });
  }
});


// ==========================================
// VITE DEV SERVER / PRODUCTION SERVING
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Spendly] Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
