import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db';
import { AppSettings } from './server/mongodb';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Use cookie parser & payload limits
app.use(cookieParser());
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
// AUTHENTICATION & MIDDLEWARE
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET || 'spendly-default-secret-key-12345';

// Authentication Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = req.cookies?.spendly_session;
  
  // Accept Authorization header fallback for iframe environment stability
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token found.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'admin' | 'user' };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

// Admin Middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  requireAuth(req, res, () => {
    const user = db.getUser((req as any).user?.id);
    if (
      (req as any).user?.role === 'admin' || 
      user?.role === 'admin' || 
      user?.email?.toLowerCase() === 'gauthamkk30@gmail.com' ||
      (req as any).user?.email?.toLowerCase() === 'gauthamkk30@gmail.com'
    ) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
  });
};

// ==========================================
// OAUTH & AUTHENTICATION ENDPOINTS
// ==========================================

// Get OAuth Authorize URL (serves Google or Mock Sandbox)
app.get('/api/auth/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/auth/callback`;

  if (!clientId || !clientSecret) {
    // Return mock login URL if Google OAuth credentials are not set
    return res.json({ 
      url: `/api/auth/mock-google-login`,
      isMock: true 
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, isMock: false });
});

// Mock Google Login page served in sandbox mode
app.get('/api/auth/mock-google-login', (req, res) => {
  const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2309090b'><circle cx='50' cy='50' r='50' fill='%2309090b' stroke='%2327272a' stroke-width='2'/><path d='M50 25a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 38c-18 0-30 10-30 10v4h60v-4s-12-10-30-10z' fill='%23a1a1aa'/></svg>";
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in with Google - Gateway</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #09090b;
        }
        .glow {
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.08);
        }
      </style>
    </head>
    <body class="flex items-center justify-center min-h-screen p-4 text-zinc-100">
      <div class="glow bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-3xl max-w-[440px] w-full relative overflow-hidden backdrop-blur-xl">
        <div class="absolute -right-24 -top-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -left-24 -bottom-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <!-- Header -->
        <div class="flex flex-col items-center text-center mb-8 relative z-10">
          <div class="h-12 w-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
            <svg class="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.49c0,-0.61 -0.05,-1.2 -0.15,-1.78Z" fill="#4285F4" />
              <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-2.92,-2.27c-0.8,0.54 -1.84,0.87 -3.04,0.87c-2.34,0 -4.33,-1.58 -5.04,-3.7H3.92v2.21c1.5,2.98 4.6,5.07 8.08,5.07Z" fill="#34A853" />
              <path d="M6.96,13.34c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.73H3.92C3.31,8.95 3,10.32 3,11.64c0,1.32 0.31,2.69 0.92,3.91l3.04,-2.21Z" fill="#FBBC05" />
              <path d="M12,6.76c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.09 14.42,3.38 12,3.38c-3.48,0 -6.58,2.09 -8.08,5.07l3.04,2.21c0.71,-2.12 2.7,-3.7 5.04,-3.7Z" fill="#EA4335" />
            </svg>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-white">Google Identity Gateway</h1>
          <p class="text-xs text-zinc-400 mt-1">Select an account to authorize secure workspace access</p>
        </div>

        <!-- Accounts Grid -->
        <div class="space-y-3 relative z-10">
          
          <!-- Gautham KK30 Admin -->
          <a href="/auth/callback?code=mock_code_sandbox&email=gauthamkk30@gmail.com&name=Gautham+K&avatarUrl=${encodeURIComponent(defaultAvatar)}" 
             class="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-950/80 hover:border-emerald-500/50 transition-all duration-300">
            <div class="relative shrink-0">
              <img src="${defaultAvatar}" alt="Gautham K" class="h-10 w-10 rounded-xl object-cover border border-zinc-800" />
              <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-900"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Gautham K</span>
                <span class="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Admin</span>
              </div>
              <p class="text-[10px] text-zinc-400 truncate">gauthamkk30@gmail.com</p>
            </div>
          </a>

          <!-- Standard Guest -->
          <a href="/auth/callback?code=mock_code_sandbox&email=guest@spendly.io&name=Spendly+Guest&avatarUrl=${encodeURIComponent(defaultAvatar)}" 
             class="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-950/80 hover:border-zinc-700 transition-all duration-300">
            <div class="relative shrink-0">
              <img src="${defaultAvatar}" alt="Spendly Guest" class="h-10 w-10 rounded-xl object-cover border border-zinc-800" />
              <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-blue-500 border-2 border-zinc-900"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white group-hover:text-zinc-300 transition-colors">Spendly Guest</span>
                <span class="text-[8px] font-bold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Client</span>
              </div>
              <p class="text-[10px] text-zinc-400 truncate">guest@spendly.io</p>
            </div>
          </a>

          <!-- Standard Analyst -->
          <a href="/auth/callback?code=mock_code_sandbox&email=analyst@spendly.io&name=Meera+Nair&avatarUrl=${encodeURIComponent(defaultAvatar)}" 
             class="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-950/80 hover:border-zinc-700 transition-all duration-300">
            <div class="relative shrink-0">
              <img src="${defaultAvatar}" alt="Meera Nair" class="h-10 w-10 rounded-xl object-cover border border-zinc-800" />
              <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-indigo-500 border-2 border-zinc-900"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white group-hover:text-zinc-300 transition-colors">Meera Nair</span>
                <span class="text-[8px] font-bold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Analyst</span>
              </div>
              <p class="text-[10px] text-zinc-400 truncate">analyst@spendly.io</p>
            </div>
          </a>

        </div>

        <!-- Custom Account expander -->
        <div class="mt-6 relative z-10 border-t border-zinc-800/60 pt-4">
          <button onclick="toggleCustomForm()" class="w-full text-center text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer py-1 flex items-center justify-center gap-1">
            <span>＋ Use another Google Account</span>
          </button>
          
          <form id="custom-form" action="/auth/callback" method="GET" class="hidden mt-4 space-y-3">
            <input type="hidden" name="code" value="mock_code_sandbox" />
            <input type="hidden" name="avatarUrl" value="${defaultAvatar}" />
            
            <div>
              <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Custom Google Email</label>
              <input type="email" name="email" required placeholder="name@company.com" 
                     class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            
            <div>
              <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Custom Display Name</label>
              <input type="text" name="name" required placeholder="e.g. Sarah Connor" 
                     class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all" />
            </div>

            <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-2.5 rounded-xl transition-all text-xs shadow-lg shadow-emerald-500/10">
              Instantly Provision Account
            </button>
          </form>
        </div>
      </div>

      <script>
        function toggleCustomForm() {
          const form = document.getElementById('custom-form');
          form.classList.toggle('hidden');
        }
      </script>
    </body>
    </html>
  `);
});

// OAuth Callback Route
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, email, name, avatarUrl } = req.query;

  let googleEmail = '';
  let googleName = '';
  let googleAvatar = '';
  let googleId = '';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/auth/callback`;

  if (!clientId || !clientSecret || code === 'mock_code_sandbox') {
    // Sandbox / Mock login flow
    googleEmail = (email as string) || 'guest@spendly.io';
    googleName = (name as string) || 'Spendly Guest';
    googleAvatar = (avatarUrl as string) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';
    googleId = `google-mock-${googleEmail}`;
  } else {
    // Real Google OAuth flow
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to exchange Google authorization code');
      }

      const tokenData = await tokenRes.json();
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!profileRes.ok) {
        throw new Error('Failed to fetch Google profile info');
      }

      const profile = await profileRes.json();
      googleEmail = profile.email;
      googleName = profile.name;
      googleAvatar = profile.picture;
      googleId = profile.id;
    } catch (err: any) {
      console.error('Google OAuth Exchange Error:', err);
      return res.status(500).send(`
        <html>
          <body style="background-color: #fef2f2; color: #991b1b; padding: 2rem; font-family: sans-serif;">
            <h1 style="font-size: 1.25rem; font-weight: bold;">Google Authentication Error</h1>
            <p>${err.message}</p>
            <p>Please close this window and try again.</p>
          </body>
        </html>
      `);
    }
  }

  // Get or create user in JSON database
  const user = db.getOrCreateUserByEmail(googleEmail, googleName, googleAvatar, googleId);

  // Sign JWT Token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  // Set SameSite=None, Secure=true cookie so it works in cross-origin iframe
  res.cookie('spendly_session', token, {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Return success callback HTML that notifies parent and closes
  res.send(`
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="font-sans flex items-center justify-center min-h-screen bg-emerald-50">
        <div class="text-center p-8 bg-white rounded-2xl shadow-md max-w-sm border border-emerald-100">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-1">Sign-in Successful!</h2>
          <p class="text-sm text-gray-500 mb-4">Logged in as <strong>${user.name}</strong> (${user.email})</p>
          <p class="text-xs text-gray-400">Closing window...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
            setTimeout(function() {
              window.close();
            }, 800);
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

// Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('spendly_session', {
    secure: true,
    sameSite: 'none',
    httpOnly: true
  });
  res.json({ success: true });
});

// Me Endpoint
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.getUser((req as any).user.id);
  res.json(user);
});

// ==========================================
// PROTECTED API ENDPOINTS
// ==========================================

// ==========================================
// PWA MANIFEST & BRAND ICON ENDPOINTS
// ==========================================

let cachedBase64Logo = '';
let lastFetchedLogoUrl = '';

async function getLogoAsBase64(logoUrl: string): Promise<string> {
  if (!logoUrl) return '';
  if (logoUrl.startsWith('data:')) return logoUrl;
  if (logoUrl === lastFetchedLogoUrl && cachedBase64Logo) {
    return cachedBase64Logo;
  }
  try {
    const res = await fetch(logoUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || 'image/png';
      const base64 = Buffer.from(buffer).toString('base64');
      cachedBase64Logo = `data:${contentType};base64,${base64}`;
      lastFetchedLogoUrl = logoUrl;
      return cachedBase64Logo;
    }
  } catch (e) {
    console.error('Failed to pre-fetch logo as base64:', e);
  }
  return '';
}

// Serve Dynamic PWA Manifest to support brand customization on installation
app.get('/manifest.json', async (req, res) => {
  try {
    const config = await AppSettings.findOne();
    const appName = config?.applicationName || 'Spendly';
    const tagline = config?.tagline || 'Smarter Wealth & Ledger Auditing Suite';
    const primaryColor = config?.brandColors?.primary || '#09090b';

    res.setHeader('Content-Type', 'application/json');
    res.json({
      name: appName,
      short_name: appName,
      description: tagline,
      start_url: '/',
      display: 'standalone',
      background_color: primaryColor,
      theme_color: primaryColor,
      orientation: 'portrait-primary',
      scope: '/',
      icons: [
        {
          src: '/api/pwa-icon?size=192',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/api/pwa-icon?size=512',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/api/pwa-icon?size=192&purpose=maskable',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'maskable'
        },
        {
          src: '/api/pwa-icon?size=512&purpose=maskable',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Dynamic Vector Icon supporting all standard sizes and dynamic backgrounds
app.get('/api/pwa-icon', async (req, res) => {
  try {
    const size = parseInt(req.query.size as string) || 512;
    const isMaskable = req.query.purpose === 'maskable';
    const config = await AppSettings.findOne();
    
    const primaryColor = config?.brandColors?.primary || '#09090b';
    const secondaryColor = config?.brandColors?.secondary || '#27272a';
    const logoUrl = config?.logoUrl || '';
    
    // Resolve external or data-URI logo to dynamic base64 to ensure secure SVG rendering
    const base64Logo = logoUrl ? await getLogoAsBase64(logoUrl) : '';

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    const rxValue = isMaskable ? '0' : '128'; // Fully square for maskable container specs

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="pwa-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rxValue}" fill="url(#pwa-grad)" />
  ${base64Logo ? `
  <g transform="translate(96, 96)">
    <clipPath id="logo-clip">
      <rect width="320" height="320" rx="64" />
    </clipPath>
    <g clip-path="url(#logo-clip)">
      <image href="${base64Logo}" width="320" height="320" />
    </g>
  </g>
  ` : `
  <circle cx="256" cy="256" r="140" fill="#09090b" opacity="0.4" />
  <text x="256" y="296" font-family="system-ui, -apple-system, sans-serif" font-size="150" font-weight="900" fill="#10b981" text-anchor="middle">S</text>
  <path d="M210,140 L302,140" stroke="#34d399" stroke-width="8" stroke-linecap="round" opacity="0.7" />
  `}
</svg>`.trim();

    res.send(svg);
  } catch (err: any) {
    res.status(500).send(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#09090b"/><text x="256" y="256" fill="white" font-family="sans-serif" text-anchor="middle">Spendly</text></svg>`);
  }
});

// Brand Customization Config Endpoints (Public GET, Protected Admin PUT)
app.get('/api/config', async (req, res) => {
  try {
    const config = await AppSettings.findOne();
    res.json({
      appName: config?.applicationName || 'Spendly',
      appLogo: config?.logoUrl || '',
      appFavicon: config?.faviconUrl || '',
      applicationName: config?.applicationName || 'Spendly',
      logoUrl: config?.logoUrl || '',
      faviconUrl: config?.faviconUrl || '',
      tagline: config?.tagline || 'Smarter Wealth & Ledger Auditing Suite',
      brandColors: config?.brandColors || { primary: '#09090b', secondary: '#27272a' },
      updatedAt: config?.updatedAt,
      updatedBy: config?.updatedBy
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/config', requireAdmin, async (req, res) => {
  try {
    const { appName, appLogo, appFavicon, applicationName, logoUrl, faviconUrl, tagline, brandColors } = req.body;
    const name = appName || applicationName;
    const logo = appLogo || logoUrl || '';
    const favicon = appFavicon || faviconUrl || logo;

    if (!name) {
      return res.status(400).json({ error: 'appName or applicationName is required' });
    }

    const updatedBy = (req as any).user?.email || 'admin';
    await AppSettings.updateOne({}, {
      $set: {
        applicationName: name.trim(),
        logoUrl: logo.trim(),
        faviconUrl: favicon.trim(),
        tagline: tagline ? tagline.trim() : undefined,
        brandColors: brandColors || undefined,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy
      }
    }, { upsert: true });

    const config = await AppSettings.findOne();
    res.json({
      appName: config?.applicationName || 'Spendly',
      appLogo: config?.logoUrl || '',
      appFavicon: config?.faviconUrl || '',
      applicationName: config?.applicationName || 'Spendly',
      logoUrl: config?.logoUrl || '',
      faviconUrl: config?.faviconUrl || '',
      tagline: config?.tagline || 'Smarter Wealth & Ledger Auditing Suite',
      brandColors: config?.brandColors || { primary: '#09090b', secondary: '#27272a' },
      updatedAt: config?.updatedAt,
      updatedBy: config?.updatedBy
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Restore User Data Endpoint
app.post('/api/auth/google/restore', requireAuth, (req, res) => {
  const { userId, payload } = req.body;
  if (!userId || !payload) {
    return res.status(400).json({ error: 'userId and payload are required' });
  }
  // Keep users isolated, verify that the logged-in user matches the requested restored userId
  if (userId !== (req as any).user.id) {
    return res.status(403).json({ error: 'Forbidden. You can only restore your own data.' });
  }
  db.restoreUserData(userId, payload);
  res.json({ success: true });
});

// 1. User Endpoints
app.get('/api/user', requireAuth, (req, res) => {
  res.json(db.getUser((req as any).user.id));
});

app.put('/api/user', requireAuth, (req, res) => {
  const updated = db.updateUser((req as any).user.id, req.body);
  res.json(updated);
});

// 2. Wallet Endpoints
app.get('/api/wallets', requireAuth, (req, res) => {
  res.json(db.getWallets((req as any).user.id));
});

app.post('/api/wallets', requireAuth, (req, res) => {
  const { name, balance, type, currency } = req.body;
  if (!name || balance === undefined || !type || !currency) {
    return res.status(400).json({ error: 'Missing required wallet fields' });
  }
  const newWallet = db.addWallet((req as any).user.id, {
    id: `w-${Date.now()}`,
    name,
    balance: Number(balance),
    type,
    currency
  });
  res.status(201).json(newWallet);
});

app.put('/api/wallets/:id', requireAuth, (req, res) => {
  const updated = db.updateWallet((req as any).user.id, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Wallet not found' });
  res.json(updated);
});

app.delete('/api/wallets/:id', requireAuth, (req, res) => {
  const success = db.deleteWallet((req as any).user.id, req.params.id);
  if (!success) return res.status(404).json({ error: 'Wallet not found' });
  res.json({ success: true });
});

// 3. Category Endpoints
app.get('/api/categories', requireAuth, (req, res) => {
  res.json(db.getCategories((req as any).user.id));
});

app.post('/api/categories', requireAuth, (req, res) => {
  const { name, icon, color, type } = req.body;
  if (!name || !icon || !color || !type) {
    return res.status(400).json({ error: 'Missing required category fields' });
  }
  const newCategory = db.addCategory((req as any).user.id, {
    id: `cat-${Date.now()}`,
    name,
    icon,
    color,
    type,
    isCustom: true
  });
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
  const updated = db.updateCategory((req as any).user.id, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  const success = db.deleteCategory((req as any).user.id, req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// 4. Transaction Endpoints
app.get('/api/transactions', requireAuth, (req, res) => {
  res.json(db.getTransactions((req as any).user.id));
});

app.post('/api/transactions', requireAuth, (req, res) => {
  const { walletId, categoryId, amount, type, date, merchant, note, tags, isRecurring, recurringInterval, ocrExtracted } = req.body;
  if (!walletId || !categoryId || amount === undefined || !type || !date || !merchant) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }
  const newTx = db.addTransaction((req as any).user.id, {
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

app.put('/api/transactions/:id', requireAuth, (req, res) => {
  const updated = db.updateTransaction((req as any).user.id, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Transaction not found' });
  res.json(updated);
});

app.delete('/api/transactions/:id', requireAuth, (req, res) => {
  const success = db.deleteTransaction((req as any).user.id, req.params.id);
  if (!success) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

// Bulk Transaction Deletion
app.post('/api/transactions/bulk-delete', requireAuth, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid or missing transaction IDs' });
  }
  let count = 0;
  ids.forEach(id => {
    if (db.deleteTransaction((req as any).user.id, id)) {
      count++;
    }
  });
  res.json({ success: true, deletedCount: count });
});

// 5. Budget Endpoints
app.get('/api/budgets', requireAuth, (req, res) => {
  res.json(db.getBudgets((req as any).user.id));
});

app.post('/api/budgets', requireAuth, (req, res) => {
  const { categoryId, amount, period } = req.body;
  if (!categoryId || amount === undefined || !period) {
    return res.status(400).json({ error: 'Missing required budget fields' });
  }
  const now = new Date();
  const newBudget = db.addBudget((req as any).user.id, {
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

app.delete('/api/budgets/:id', requireAuth, (req, res) => {
  const success = db.deleteBudget((req as any).user.id, req.params.id);
  if (!success) return res.status(404).json({ error: 'Budget not found' });
  res.json({ success: true });
});

// 6. Goal Endpoints
app.get('/api/goals', requireAuth, (req, res) => {
  res.json(db.getGoals((req as any).user.id));
});

app.post('/api/goals', requireAuth, (req, res) => {
  const { name, targetAmount, currentAmount, category, deadline } = req.body;
  if (!name || targetAmount === undefined || currentAmount === undefined || !category || !deadline) {
    return res.status(400).json({ error: 'Missing required goal fields' });
  }
  const newGoal = db.addGoal((req as any).user.id, {
    id: `g-${Date.now()}`,
    name,
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount),
    category,
    deadline
  });
  res.status(201).json(newGoal);
});

app.put('/api/goals/:id', requireAuth, (req, res) => {
  const updated = db.updateGoal((req as any).user.id, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Goal not found' });
  res.json(updated);
});

app.delete('/api/goals/:id', requireAuth, (req, res) => {
  const success = db.deleteGoal((req as any).user.id, req.params.id);
  if (!success) return res.status(404).json({ error: 'Goal not found' });
  res.json({ success: true });
});

// 7. Notification Endpoints
app.get('/api/notifications', requireAuth, (req, res) => {
  res.json(db.getNotifications((req as any).user.id));
});

app.put('/api/notifications/:id/read', requireAuth, (req, res) => {
  const success = db.markNotificationRead((req as any).user.id, req.params.id);
  if (!success) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true });
});

app.delete('/api/notifications', requireAuth, (req, res) => {
  db.clearAllNotifications((req as any).user.id);
  res.json({ success: true });
});

// 7.5. Recycle Bin Endpoints
app.get('/api/recycle-bin', requireAuth, (req, res) => {
  res.json(db.getDeletedItems((req as any).user.id));
});

app.post('/api/recycle-bin/restore', requireAuth, (req, res) => {
  const { type, id } = req.body;
  if (!type || !id) {
    return res.status(400).json({ error: 'Missing type or id' });
  }
  const success = db.restoreItem((req as any).user.id, type, id);
  if (!success) {
    return res.status(404).json({ error: 'Item not found or failed to restore' });
  }
  res.json({ success: true });
});

app.delete('/api/recycle-bin/permanent/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params;
  if (!type || !id) {
    return res.status(400).json({ error: 'Missing type or id' });
  }
  const success = db.permanentlyDeleteItem((req as any).user.id, type, id);
  if (!success) {
    return res.status(404).json({ error: 'Item not found or failed to permanently delete' });
  }
  res.json({ success: true });
});

// 8. Receipt OCR Endpoint (AI-powered with Gemini!)
app.post('/api/ocr', requireAuth, async (req, res) => {
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
  // Connect to database (MongoDB Atlas or Dev Fallback) before booting server
  await db.connect();

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
