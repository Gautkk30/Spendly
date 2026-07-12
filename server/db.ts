import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
import { 
  DEFAULT_CATEGORIES, 
  INITIAL_USER, 
  INITIAL_WALLETS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_GOALS, 
  INITIAL_NOTIFICATIONS,
  DEFAULT_AVATAR
} from '../src/data/defaultData';
import { 
  Category, 
  Wallet, 
  Transaction, 
  Budget, 
  Goal, 
  Notification, 
  UserProfile 
} from '../src/types';

const DB_PATH = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  user: UserProfile;
  users?: UserProfile[];
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  notifications: Notification[];
  appConfig?: {
    appName: string;
    appLogo: string;
  };
  appSettings?: {
    _id: string;
    applicationName: string;
    logoUrl: string;
    faviconUrl: string;
    tagline?: string;
    brandColors?: {
      primary: string;
      secondary: string;
    };
    updatedAt: string;
    updatedBy: string;
  };
}

class Database {
  private data: DatabaseSchema;
  private client: MongoClient | null = null;
  private mongoDb: Db | null = null;

  constructor() {
    // Start with a safe default so memory access is immediately valid before connect() finishes
    this.data = {
      user: INITIAL_USER,
      users: [INITIAL_USER],
      wallets: [],
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      budgets: [],
      goals: [],
      notifications: [],
      appConfig: {
        appName: 'Spendly',
        appLogo: ''
      }
    };
  }

  public async connect(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      if (isProduction) {
        console.error('FATAL ERROR: MONGODB_URI is not set in production. MongoDB Atlas is required for production persistence.');
        process.exit(1);
      } else {
        console.log('[Spendly] MONGODB_URI is not configured. Falling back to local db.json mock database for development.');
        this.data = this.loadLocal();
        this.migrateDefaultAccounts();
        return;
      }
    }

    try {
      console.log('[Spendly] Connecting to MongoDB Atlas...');
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      await this.client.connect();
      this.mongoDb = this.client.db('spendly');
      console.log('[Spendly] Successfully connected to MongoDB database "spendly".');

      // Load data from MongoDB
      await this.loadFromMongo();
      this.migrateDefaultAccounts();
    } catch (err: any) {
      console.error('[Spendly] Failed to connect to MongoDB:', err);
      if (isProduction) {
        console.error('FATAL ERROR: Production requires a persistent MongoDB Atlas connection. Exiting...');
        process.exit(1);
      } else {
        console.log('[Spendly] Reverting to local db.json mock database for local development.');
        this.data = this.loadLocal();
        this.migrateDefaultAccounts();
      }
    }
  }

  public migrateDefaultAccounts(): void {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    
    // Assign any orphaned data to 'usr-101'
    this.data.wallets.forEach(w => {
      if (!(w as any).userId) (w as any).userId = 'usr-101';
    });
    this.data.transactions.forEach(t => {
      if (!(t as any).userId) (t as any).userId = 'usr-101';
    });
    this.data.budgets.forEach(b => {
      if (!(b as any).userId) (b as any).userId = 'usr-101';
    });
    this.data.goals.forEach(g => {
      if (!(g as any).userId) (g as any).userId = 'usr-101';
    });
    this.data.notifications.forEach(n => {
      if (!(n as any).userId) (n as any).userId = 'usr-101';
    });

    const defaultWalletNames = [
      "HDFC Checking", "ICICI Savings", "Cash Wallet", "Amex Gold", 
      "Cash", "Bank", "Default Wallet", "HDFC Checking (Migrated)",
      "ICICI Savings (Migrated)", "Cash Wallet (Migrated)", "Amex Gold (Migrated)"
    ];
    const defaultWalletIds = ["w-main", "w-savings", "w-cash", "w-credit"];

    this.data.users.forEach(user => {
      const userId = user.id;

      // Filter active (non-deleted) wallets for this user
      const userWallets = this.data.wallets.filter(w => 
        (w as any).userId === userId && !w.isDeleted
      );

      userWallets.forEach(wallet => {
        const isDefault = defaultWalletIds.includes(wallet.id) || defaultWalletNames.includes(wallet.name);
        if (!isDefault) return;

        // Check if there are transactions referencing this default wallet
        const hasTxs = this.data.transactions.some(t => t.walletId === wallet.id && !t.isDeleted);

        if (hasTxs) {
          // Create a new real user-owned wallet
          const newWalletId = `w-user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const migratedWallet: Wallet = {
            id: newWalletId,
            name: wallet.name.endsWith(" (Migrated)") ? wallet.name : `${wallet.name} (Migrated)`,
            balance: wallet.balance,
            type: wallet.type,
            currency: wallet.currency || 'INR',
            createdAt: wallet.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            userId: userId as any
          };
          this.data.wallets.push(migratedWallet);

          // Update transactions referencing the default wallet to point to the new wallet ID
          this.data.transactions.forEach(t => {
            if (t.walletId === wallet.id) {
              t.walletId = newWalletId;
            }
          });

          console.log(`[Migration] Created real user-owned wallet "${migratedWallet.name}" (${newWalletId}) for user ${userId} and migrated transactions.`);
        }

        // Remove the default wallet from data
        wallet.isDeleted = true;
        this.data.wallets = this.data.wallets.filter(w => w.id !== wallet.id);
        console.log(`[Migration] Cleaned default wallet "${wallet.name}" for user ${userId}`);
      });
    });

    this.save();
  }

  private loadLocal(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (!parsed.users) {
          parsed.users = [parsed.user || INITIAL_USER];
        }
        if (!parsed.appConfig) {
          parsed.appConfig = { appName: 'Spendly', appLogo: '' };
        }

        // Ensure user roles are correctly set
        if (parsed.user) {
          if (parsed.user.email?.toLowerCase() === 'gauthamkk30@gmail.com') {
            parsed.user.role = 'admin';
          } else if (!parsed.user.role) {
            parsed.user.role = 'user';
          }
        }
        if (parsed.users) {
          parsed.users.forEach((u: any) => {
            if (u.email?.toLowerCase() === 'gauthamkk30@gmail.com') {
              u.role = 'admin';
            } else if (!u.role) {
              u.role = 'user';
            }
          });
        }
        
        // Purge legacy mock items to make sure every user starts at exactly ZERO stats
        const mockTxIds = ['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5', 'tx-6', 'tx-7', 'tx-8', 'tx-9'];
        if (parsed.transactions) {
          parsed.transactions = parsed.transactions.filter((tx: any) => !mockTxIds.includes(tx.id));
        } else {
          parsed.transactions = [];
        }

        const mockBudgetIds = ['b-1', 'b-2', 'b-3', 'b-4'];
        if (parsed.budgets) {
          parsed.budgets = parsed.budgets.filter((b: any) => !mockBudgetIds.includes(b.id));
        } else {
          parsed.budgets = [];
        }

        const mockGoalIds = ['g-1', 'g-2', 'g-3'];
        if (parsed.goals) {
          parsed.goals = parsed.goals.filter((g: any) => !mockGoalIds.includes(g.id));
        } else {
          parsed.goals = [];
        }

        // Recalculate wallet balances dynamically based on remaining user-created transactions
        if (parsed.wallets) {
          parsed.wallets.forEach((w: any) => {
            const txs = parsed.transactions.filter((tx: any) => tx.walletId === w.id);
            let balance = 0;
            txs.forEach((tx: any) => {
              if (tx.type === 'income') {
                balance += tx.amount;
              } else {
                balance -= tx.amount;
              }
            });
            w.balance = balance;
          });
        }

        return parsed;
      }
    } catch (e) {
      console.error('Failed to load local DB file, reverting to default data', e);
    }

    const defaultDB: DatabaseSchema = {
      user: INITIAL_USER,
      users: [INITIAL_USER],
      wallets: [],
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      budgets: [],
      goals: [],
      notifications: [],
      appConfig: {
        appName: 'Spendly',
        appLogo: ''
      }
    };

    this.saveData(defaultDB);
    return defaultDB;
  }

  private async loadFromMongo(): Promise<void> {
    if (!this.mongoDb) return;

    const collections = {
      users: this.mongoDb.collection('users'),
      wallets: this.mongoDb.collection('wallets'),
      categories: this.mongoDb.collection('categories'),
      transactions: this.mongoDb.collection('transactions'),
      budgets: this.mongoDb.collection('budgets'),
      goals: this.mongoDb.collection('goals'),
      notifications: this.mongoDb.collection('notifications'),
      appConfig: this.mongoDb.collection('appConfig'),
      appSettings: this.mongoDb.collection('appSettings'),
      globals: this.mongoDb.collection('globals'),
    };

    const users = await collections.users.find({}).toArray();
    const wallets = await collections.wallets.find({}).toArray();
    const categories = await collections.categories.find({}).toArray();
    const transactions = await collections.transactions.find({}).toArray();
    const budgets = await collections.budgets.find({}).toArray();
    const goals = await collections.goals.find({}).toArray();
    const notifications = await collections.notifications.find({}).toArray();

    const appConfigDoc = await collections.appConfig.findOne({ _id: 'app_config' as any });
    const appSettingsDoc = await collections.appSettings.findOne({});
    const fallbackUserDoc = await collections.globals.findOne({ _id: 'fallback_user' as any });

    const cleanItems = (items: any[]) => items.map(item => {
      const { _id, ...rest } = item;
      return rest;
    });

    const parsedUsers = cleanItems(users) as UserProfile[];
    const parsedWallets = cleanItems(wallets) as Wallet[];
    const parsedCategories = cleanItems(categories) as Category[];
    const parsedTransactions = cleanItems(transactions) as Transaction[];
    const parsedBudgets = cleanItems(budgets) as Budget[];
    const parsedGoals = cleanItems(goals) as Goal[];
    const parsedNotifications = cleanItems(notifications) as Notification[];

    if (parsedUsers.length === 0) {
      console.log('[Spendly] No database records found in MongoDB. Seeding initial data...');
      const seedData: DatabaseSchema = {
        user: INITIAL_USER,
        users: [INITIAL_USER],
        wallets: [],
        categories: DEFAULT_CATEGORIES,
        transactions: [],
        budgets: [],
        goals: [],
        notifications: [],
        appConfig: {
          appName: 'Spendly',
          appLogo: ''
        },
        appSettings: {
          _id: '64b1f893f0b2a5c1a8d01234',
          applicationName: 'Spendly',
          logoUrl: '',
          faviconUrl: '',
          tagline: 'Smarter Wealth & Ledger Auditing Suite',
          brandColors: {
            primary: '#09090b',
            secondary: '#27272a'
          },
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      };

      // Set roles and do legacy mock-purge as standard
      seedData.users!.forEach(u => {
        if (u.email?.toLowerCase() === 'gauthamkk30@gmail.com') {
          u.role = 'admin';
        } else if (!u.role) {
          u.role = 'user';
        }
      });
      if (seedData.user.email?.toLowerCase() === 'gauthamkk30@gmail.com') {
        seedData.user.role = 'admin';
      }

      const mockTxIds = ['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5', 'tx-6', 'tx-7', 'tx-8', 'tx-9'];
      seedData.transactions = seedData.transactions.filter((tx: any) => !mockTxIds.includes(tx.id));
      const mockBudgetIds = ['b-1', 'b-2', 'b-3', 'b-4'];
      seedData.budgets = seedData.budgets.filter((b: any) => !mockBudgetIds.includes(b.id));
      const mockGoalIds = ['g-1', 'g-2', 'g-3'];
      seedData.goals = seedData.goals.filter((g: any) => !mockGoalIds.includes(g.id));

      // Re-calculate balances
      seedData.wallets.forEach((w: any) => {
        const txs = seedData.transactions.filter((tx: any) => tx.walletId === w.id);
        let balance = 0;
        txs.forEach((tx: any) => {
          if (tx.type === 'income') {
            balance += tx.amount;
          } else {
            balance -= tx.amount;
          }
        });
        w.balance = balance;
      });

      this.data = seedData;
      await this.saveToMongo();
    } else {
      this.data = {
        user: fallbackUserDoc?.user || parsedUsers[0] || INITIAL_USER,
        users: parsedUsers,
        wallets: parsedWallets,
        categories: parsedCategories,
        transactions: parsedTransactions,
        budgets: parsedBudgets,
        goals: parsedGoals,
        notifications: parsedNotifications,
        appConfig: appConfigDoc ? { appName: appConfigDoc.appName, appLogo: appConfigDoc.appLogo } : { appName: 'Spendly', appLogo: '' },
        appSettings: appSettingsDoc ? (appSettingsDoc as any) : undefined
      };
    }
  }

  private async saveToMongo(): Promise<void> {
    if (!this.mongoDb) return;

    try {
      const collections = {
        users: this.mongoDb.collection('users'),
        wallets: this.mongoDb.collection('wallets'),
        categories: this.mongoDb.collection('categories'),
        transactions: this.mongoDb.collection('transactions'),
        budgets: this.mongoDb.collection('budgets'),
        goals: this.mongoDb.collection('goals'),
        notifications: this.mongoDb.collection('notifications'),
        appConfig: this.mongoDb.collection('appConfig'),
        appSettings: this.mongoDb.collection('appSettings'),
        globals: this.mongoDb.collection('globals'),
      };

      await this.syncMongoCollection(collections.users, this.data.users || [this.data.user]);
      await this.syncMongoCollection(collections.wallets, this.data.wallets);
      await this.syncMongoCollection(collections.categories, this.data.categories);
      await this.syncMongoCollection(collections.transactions, this.data.transactions);
      await this.syncMongoCollection(collections.budgets, this.data.budgets);
      await this.syncMongoCollection(collections.goals, this.data.goals);
      await this.syncMongoCollection(collections.notifications, this.data.notifications);

      if (this.data.appConfig) {
        await collections.appConfig.updateOne(
          { _id: 'app_config' as any },
          { $set: this.data.appConfig },
          { upsert: true }
        );
      }

      if (this.data.appSettings) {
        const { _id, ...rest } = this.data.appSettings;
        await collections.appSettings.updateOne(
          { _id: (_id || '64b1f893f0b2a5c1a8d01234') as any },
          { $set: rest },
          { upsert: true }
        );
      }

      await collections.globals.updateOne(
        { _id: 'fallback_user' as any },
        { $set: { user: this.data.user } },
        { upsert: true }
      );
    } catch (err) {
      console.error('[Spendly] Error saving data to MongoDB:', err);
    }
  }

  private async syncMongoCollection(collection: any, items: any[]): Promise<void> {
    if (!items || items.length === 0) {
      await collection.deleteMany({});
      return;
    }

    const ids = items.map(item => item.id);
    await collection.deleteMany({ id: { $nin: ids } });

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: item },
        upsert: true
      }
    }));
    await collection.bulkWrite(bulkOps);
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write to local DB file', e);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public save() {
    if (this.mongoDb) {
      this.saveToMongo().catch(err => {
        console.error('[Spendly] Error in background MongoDB save:', err);
      });
    } else {
      this.saveData(this.data);
    }
  }


  // App Branding config Actions
  public getAppConfig() {
    if (!this.data.appConfig) {
      this.data.appConfig = { appName: 'Spendly', appLogo: '' };
    }
    return this.data.appConfig;
  }

  public updateAppConfig(update: { appName: string; appLogo: string }) {
    this.data.appConfig = { ...this.getAppConfig(), ...update };
    this.save();
    return this.data.appConfig;
  }

  // User Actions
  public getUsers(): UserProfile[] {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    return this.data.users;
  }

  public deleteUser(userId: string): boolean {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    
    const originalLength = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    
    // Cleanup other tables/collections for this user to avoid orphan records
    this.data.wallets = this.data.wallets.filter(w => (w as any).userId !== userId);
    this.data.transactions = this.data.transactions.filter(t => (t as any).userId !== userId);
    this.data.budgets = this.data.budgets.filter(b => (b as any).userId !== userId);
    this.data.goals = this.data.goals.filter(g => (g as any).userId !== userId);
    this.data.notifications = this.data.notifications.filter(n => (n as any).userId !== userId);

    // If we deleted the main fallback user, assign a remaining one or re-seed default
    if (this.data.user.id === userId) {
      if (this.data.users.length > 0) {
        this.data.user = this.data.users[0];
      } else {
        // Re-seed default if somehow everything gets wiped
        this.data.user = INITIAL_USER;
        this.data.users = [INITIAL_USER];
      }
    }
    
    this.save();
    return this.data.users.length < originalLength;
  }

  public getUser(userId: string = 'usr-101'): UserProfile {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    const found = this.data.users.find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    return found || this.data.user;
  }

  public updateUser(userId: string = 'usr-101', update: Partial<UserProfile>): UserProfile {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    const idx = this.data.users.findIndex(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...update };
      if (this.data.users[idx].id === this.data.user.id) {
        this.data.user = this.data.users[idx];
      }
    } else {
      this.data.user = { ...this.data.user, ...update };
    }
    this.save();
    return idx !== -1 ? this.data.users[idx] : this.data.user;
  }

  public getOrCreateUserByEmail(email: string, name?: string, avatarUrl?: string, googleId?: string): UserProfile {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const role = email.toLowerCase() === 'gauthamkk30@gmail.com' ? 'admin' : 'user';
    
    if (existing) {
      existing.lastLogin = new Date().toISOString();
      if (googleId) existing.googleId = googleId;
      if (name && !existing.name) existing.name = name;
      if (avatarUrl && !existing.avatarUrl) existing.avatarUrl = avatarUrl;
      existing.role = role;
      this.save();
      return existing;
    }

    const newUserId = `usr-${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: name || email.split('@')[0],
      email: email,
      avatarUrl: avatarUrl || DEFAULT_AVATAR,
      defaultCurrency: 'INR',
      language: 'en',
      theme: 'dark',
      notificationsEnabled: true,
      emailVerified: true,
      role: role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      googleId: googleId
    };
    
    this.data.users.push(newUser);

    this.data.notifications.unshift({
      id: `nt-${Date.now()}`,
      title: 'Welcome to Spendly! 🎉',
      message: 'Your Google Account profile has been set up successfully. Start tracking by creating your first entry!',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      userId: newUserId as any
    });

    this.save();
    return newUser;
  }

  // Wallets Actions
  public getWallets(userId: string = 'usr-101'): Wallet[] {
    return this.data.wallets.filter(w => 
      ((w as any).userId === userId || (!(w as any).userId && userId === 'usr-101')) && 
      !w.isDeleted
    );
  }

  public addWallet(userId: string = 'usr-101', wallet: Wallet): Wallet {
    (wallet as any).userId = userId;
    wallet.createdAt = wallet.createdAt || new Date().toISOString();
    wallet.updatedAt = new Date().toISOString();
    wallet.isDeleted = false;
    this.data.wallets.push(wallet);
    this.save();
    return wallet;
  }

  public updateWallet(userId: string, id: string, update: Partial<Wallet>): Wallet | null {
    const idx = this.data.wallets.findIndex(w => w.id === id && ((w as any).userId === userId || (!(w as any).userId && userId === 'usr-101')));
    if (idx === -1) return null;
    this.data.wallets[idx] = { 
      ...this.data.wallets[idx], 
      ...update, 
      updatedAt: new Date().toISOString() 
    };
    this.save();
    return this.data.wallets[idx];
  }

  public deleteWallet(userId: string, id: string): boolean {
    const wallet = this.data.wallets.find(w => w.id === id && ((w as any).userId === userId || (!(w as any).userId && userId === 'usr-101')));
    if (!wallet) return false;
    
    wallet.isDeleted = true;
    wallet.deletedAt = new Date().toISOString();
    wallet.deletedBy = userId;
    wallet.updatedAt = new Date().toISOString();

    // Soft delete all transactions belonging to this wallet
    this.data.transactions.forEach(t => {
      const isOwner = (t as any).userId === userId || (!(t as any).userId && userId === 'usr-101');
      if (t.walletId === id && isOwner && !t.isDeleted) {
        t.isDeleted = true;
        t.deletedAt = wallet.deletedAt;
        t.deletedBy = userId;
        t.updatedAt = new Date().toISOString();
      }
    });

    this.save();
    return true;
  }

  // Categories Actions
  public getCategories(userId?: string): Category[] {
    return this.data.categories.filter(c => 
      (!c.isCustom || (userId && (c as any).userId === userId)) && 
      !c.isDeleted
    );
  }

  public addCategory(userId: string, category: Category): Category {
    (category as any).userId = userId;
    category.createdAt = category.createdAt || new Date().toISOString();
    category.updatedAt = new Date().toISOString();
    category.isDeleted = false;
    this.data.categories.push(category);
    this.save();
    return category;
  }

  public updateCategory(userId: string, id: string, update: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id && (!c.isCustom || (c as any).userId === userId || (!(c as any).userId && userId === 'usr-101')));
    if (idx === -1) return null;
    this.data.categories[idx] = { 
      ...this.data.categories[idx], 
      ...update, 
      updatedAt: new Date().toISOString() 
    };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(userId: string, id: string): boolean {
    const category = this.data.categories.find(c => c.id === id && c.isCustom && ((c as any).userId === userId || (!(c as any).userId && userId === 'usr-101')));
    if (!category) return false;

    category.isDeleted = true;
    category.deletedAt = new Date().toISOString();
    category.deletedBy = userId;
    category.updatedAt = new Date().toISOString();

    this.save();
    return true;
  }

  // Transactions Actions
  public getTransactions(userId: string = 'usr-101'): Transaction[] {
    return this.data.transactions.filter(t => 
      ((t as any).userId === userId || (!(t as any).userId && userId === 'usr-101')) && 
      !t.isDeleted
    );
  }

  public addTransaction(userId: string = 'usr-101', tx: Transaction): Transaction {
    (tx as any).userId = userId;
    tx.createdAt = tx.createdAt || new Date().toISOString();
    tx.updatedAt = new Date().toISOString();
    tx.isDeleted = false;
    this.data.transactions.unshift(tx);

    const wallet = this.data.wallets.find(w => w.id === tx.walletId);
    if (wallet) {
      if (tx.type === 'income') {
        wallet.balance += tx.amount;
      } else {
        wallet.balance -= tx.amount;
      }
      wallet.updatedAt = new Date().toISOString();
    }

    if (tx.type === 'expense') {
      const budget = this.data.budgets.find(b => 
        (b.categoryId === tx.categoryId || b.categoryId === 'all') &&
        ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')) &&
        !b.isDeleted
      );
      if (budget) {
        budget.spent += tx.amount;
        budget.updatedAt = new Date().toISOString();
        if (budget.spent > budget.amount && budget.spent - tx.amount <= budget.amount) {
          this.addNotification(userId, {
            id: `nt-budget-alert-${Date.now()}`,
            title: 'Budget Overspent Alert',
            message: `You have exceeded your monthly budget for this category!`,
            type: 'alert',
            timestamp: new Date().toISOString(),
            read: false
          });
        } else if (budget.spent >= budget.amount * 0.8 && budget.spent - tx.amount < budget.amount * 0.8) {
          this.addNotification(userId, {
            id: `nt-budget-warn-${Date.now()}`,
            title: 'Budget Warning',
            message: `You have spent over 80% of your monthly budget for this category.`,
            type: 'warning',
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }
    }

    this.save();
    return tx;
  }

  public updateTransaction(userId: string, id: string, update: Partial<Transaction>): Transaction | null {
    const idx = this.data.transactions.findIndex(t => t.id === id && ((t as any).userId === userId || (!(t as any).userId && userId === 'usr-101')));
    if (idx === -1) return null;
    
    const oldTx = this.data.transactions[idx];
    
    // Revert old transaction's impact if it was not already deleted
    if (!oldTx.isDeleted) {
      const oldWallet = this.data.wallets.find(w => w.id === oldTx.walletId && ((w as any).userId === userId || (!(w as any).userId && userId === 'usr-101')));
      if (oldWallet) {
        if (oldTx.type === 'income') {
          oldWallet.balance -= oldTx.amount;
        } else {
          oldWallet.balance += oldTx.amount;
        }
        oldWallet.updatedAt = new Date().toISOString();
      }

      if (oldTx.type === 'expense') {
        const oldBudget = this.data.budgets.find(b => 
          (b.categoryId === oldTx.categoryId || b.categoryId === 'all') && 
          ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')) && 
          !b.isDeleted
        );
        if (oldBudget) {
          oldBudget.spent = Math.max(0, oldBudget.spent - oldTx.amount);
          oldBudget.updatedAt = new Date().toISOString();
        }
      }
    }

    const updatedTx = { 
      ...oldTx, 
      ...update, 
      updatedAt: new Date().toISOString() 
    };
    this.data.transactions[idx] = updatedTx;

    // Apply new transaction's impact if it is not soft-deleted
    if (!updatedTx.isDeleted) {
      const newWallet = this.data.wallets.find(w => w.id === updatedTx.walletId && ((w as any).userId === userId || (!(w as any).userId && userId === 'usr-101')));
      if (newWallet) {
        if (updatedTx.type === 'income') {
          newWallet.balance += updatedTx.amount;
        } else {
          newWallet.balance -= updatedTx.amount;
        }
        newWallet.updatedAt = new Date().toISOString();
      }

      if (updatedTx.type === 'expense') {
        const newBudget = this.data.budgets.find(b => 
          (b.categoryId === updatedTx.categoryId || b.categoryId === 'all') && 
          ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')) && 
          !b.isDeleted
        );
        if (newBudget) {
          newBudget.spent += updatedTx.amount;
          newBudget.updatedAt = new Date().toISOString();
        }
      }
    }

    this.save();
    return updatedTx;
  }

  public deleteTransaction(userId: string, id: string): boolean {
    const tx = this.data.transactions.find(t => t.id === id && ((t as any).userId === userId || (!(t as any).userId && userId === 'usr-101')));
    if (!tx || tx.isDeleted) return false;

    tx.isDeleted = true;
    tx.deletedAt = new Date().toISOString();
    tx.deletedBy = userId;
    tx.updatedAt = new Date().toISOString();

    // Revert balance on delete
    const wallet = this.data.wallets.find(w => w.id === tx.walletId && ((w as any).userId === userId || (!(w as any).userId && userId === 'usr-101')));
    if (wallet) {
      if (tx.type === 'income') {
        wallet.balance -= tx.amount;
      } else {
        wallet.balance += tx.amount;
      }
      wallet.updatedAt = new Date().toISOString();
    }

    // Revert budget on delete
    if (tx.type === 'expense') {
      const budget = this.data.budgets.find(b => 
        (b.categoryId === tx.categoryId || b.categoryId === 'all') && 
        ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')) && 
        !b.isDeleted
      );
      if (budget) {
        budget.spent = Math.max(0, budget.spent - tx.amount);
        budget.updatedAt = new Date().toISOString();
      }
    }

    this.save();
    return true;
  }

  // Budgets Actions
  public getBudgets(userId: string = 'usr-101'): Budget[] {
    return this.data.budgets.filter(b => 
      ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')) && 
      !b.isDeleted
    );
  }

  public addBudget(userId: string = 'usr-101', budget: Budget): Budget {
    (budget as any).userId = userId;
    budget.createdAt = budget.createdAt || new Date().toISOString();
    budget.updatedAt = new Date().toISOString();
    budget.isDeleted = false;

    const idx = this.data.budgets.findIndex(b => 
      b.categoryId === budget.categoryId && 
      b.month === budget.month && 
      b.year === budget.year &&
      ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')) &&
      !b.isDeleted
    );
    if (idx !== -1) {
      this.data.budgets[idx] = { 
        ...this.data.budgets[idx], 
        amount: budget.amount,
        updatedAt: new Date().toISOString() 
      };
      this.save();
      return this.data.budgets[idx];
    }
    
    this.data.budgets.push(budget);
    this.save();
    return budget;
  }

  public deleteBudget(userId: string, id: string): boolean {
    const budget = this.data.budgets.find(b => b.id === id && ((b as any).userId === userId || (!(b as any).userId && userId === 'usr-101')));
    if (!budget || budget.isDeleted) return false;

    budget.isDeleted = true;
    budget.deletedAt = new Date().toISOString();
    budget.deletedBy = userId;
    budget.updatedAt = new Date().toISOString();

    this.save();
    return true;
  }

  // Goals Actions
  public getGoals(userId: string = 'usr-101'): Goal[] {
    return this.data.goals.filter(g => 
      ((g as any).userId === userId || (!(g as any).userId && userId === 'usr-101')) && 
      !g.isDeleted
    );
  }

  public addGoal(userId: string = 'usr-101', goal: Goal): Goal {
    (goal as any).userId = userId;
    goal.createdAt = goal.createdAt || new Date().toISOString();
    goal.updatedAt = new Date().toISOString();
    goal.isDeleted = false;
    this.data.goals.push(goal);
    this.save();
    return goal;
  }

  public updateGoal(userId: string = 'usr-101', id: string, update: Partial<Goal>): Goal | null {
    const idx = this.data.goals.findIndex(g => g.id === id && ((g as any).userId === userId || (!(g as any).userId && userId === 'usr-101')));
    if (idx === -1) return null;
    
    const oldGoal = this.data.goals[idx];
    const updatedGoal = { 
      ...oldGoal, 
      ...update, 
      updatedAt: new Date().toISOString() 
    };
    
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount && oldGoal.currentAmount < oldGoal.targetAmount) {
      this.addNotification(userId, {
        id: `nt-goal-${Date.now()}`,
        title: 'Goal Achieved! 🎉',
        message: `Congratulations! You have fully funded your goal: "${updatedGoal.name}"!`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    this.data.goals[idx] = updatedGoal;
    this.save();
    return updatedGoal;
  }

  public deleteGoal(userId: string, id: string): boolean {
    const goal = this.data.goals.find(g => g.id === id && ((g as any).userId === userId || (!(g as any).userId && userId === 'usr-101')));
    if (!goal || goal.isDeleted) return false;

    goal.isDeleted = true;
    goal.deletedAt = new Date().toISOString();
    goal.deletedBy = userId;
    goal.updatedAt = new Date().toISOString();

    this.save();
    return true;
  }

  // Notifications Actions
  public getNotifications(userId: string = 'usr-101'): Notification[] {
    return this.data.notifications.filter(n => 
      ((n as any).userId === userId || (!(n as any).userId && userId === 'usr-101')) && 
      !n.isDeleted
    );
  }

  public addNotification(userId: string = 'usr-101', notification: Notification): Notification {
    (notification as any).userId = userId;
    notification.createdAt = notification.createdAt || new Date().toISOString();
    notification.updatedAt = new Date().toISOString();
    notification.isDeleted = false;
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public markNotificationRead(userId: string, id: string): boolean {
    const idx = this.data.notifications.findIndex(n => n.id === id && (n as any).userId === userId);
    if (idx === -1) return false;
    this.data.notifications[idx].read = true;
    this.data.notifications[idx].updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public clearAllNotifications(userId: string = 'usr-101'): void {
    this.data.notifications.forEach(n => {
      if ((n as any).userId === userId || (!(n as any).userId && userId === 'usr-101')) {
        n.isDeleted = true;
        n.deletedAt = new Date().toISOString();
        n.deletedBy = userId;
        n.updatedAt = new Date().toISOString();
      }
    });
    this.save();
  }

  // RECYCLE BIN ACTIONS
  public getDeletedItems(userId: string) {
    const checkUser = (item: any) => item.userId === userId || (!item.userId && userId === 'usr-101');
    return {
      wallets: this.data.wallets.filter(w => checkUser(w) && w.isDeleted),
      categories: this.data.categories.filter(c => checkUser(c) && c.isDeleted),
      transactions: this.data.transactions.filter(t => checkUser(t) && t.isDeleted),
      budgets: this.data.budgets.filter(b => checkUser(b) && b.isDeleted),
      goals: this.data.goals.filter(g => checkUser(g) && g.isDeleted)
    };
  }

  public restoreItem(userId: string, type: string, id: string): boolean {
    const checkUser = (item: any) => item.userId === userId || (!item.userId && userId === 'usr-101');

    if (type === 'wallets') {
      const wallet = this.data.wallets.find(w => w.id === id && checkUser(w));
      if (!wallet) return false;
      wallet.isDeleted = false;
      wallet.deletedAt = undefined;
      wallet.deletedBy = undefined;
      wallet.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }

    if (type === 'categories') {
      const cat = this.data.categories.find(c => c.id === id && checkUser(c));
      if (!cat) return false;
      cat.isDeleted = false;
      cat.deletedAt = undefined;
      cat.deletedBy = undefined;
      cat.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }

    if (type === 'transactions') {
      const tx = this.data.transactions.find(t => t.id === id && checkUser(t));
      if (!tx) return false;
      tx.isDeleted = false;
      tx.deletedAt = undefined;
      tx.deletedBy = undefined;
      tx.updatedAt = new Date().toISOString();

      // Re-apply transaction amount to wallet balance
      const wallet = this.data.wallets.find(w => w.id === tx.walletId && checkUser(w));
      if (wallet) {
        if (tx.type === 'income') {
          wallet.balance += tx.amount;
        } else {
          wallet.balance -= tx.amount;
        }
        wallet.updatedAt = new Date().toISOString();
      }

      // Re-apply amount to budget spent
      if (tx.type === 'expense') {
        const budget = this.data.budgets.find(b => 
          (b.categoryId === tx.categoryId || b.categoryId === 'all') && checkUser(b) && !b.isDeleted
        );
        if (budget) {
          budget.spent += tx.amount;
          budget.updatedAt = new Date().toISOString();
        }
      }

      this.save();
      return true;
    }

    if (type === 'budgets') {
      const budget = this.data.budgets.find(b => b.id === id && checkUser(b));
      if (!budget) return false;
      budget.isDeleted = false;
      budget.deletedAt = undefined;
      budget.deletedBy = undefined;
      budget.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }

    if (type === 'goals') {
      const goal = this.data.goals.find(g => g.id === id && checkUser(g));
      if (!goal) return false;
      goal.isDeleted = false;
      goal.deletedAt = undefined;
      goal.deletedBy = undefined;
      goal.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }

    return false;
  }

  public permanentlyDeleteItem(userId: string, type: string, id: string): boolean {
    const checkUser = (item: any) => item.userId === userId || (!item.userId && userId === 'usr-101');

    if (type === 'wallets') {
      const idx = this.data.wallets.findIndex(w => w.id === id && checkUser(w) && w.isDeleted);
      if (idx === -1) return false;
      this.data.wallets.splice(idx, 1);
      this.save();
      return true;
    }

    if (type === 'categories') {
      const idx = this.data.categories.findIndex(c => c.id === id && checkUser(c) && c.isDeleted);
      if (idx === -1) return false;
      this.data.categories.splice(idx, 1);
      this.save();
      return true;
    }

    if (type === 'transactions') {
      const idx = this.data.transactions.findIndex(t => t.id === id && checkUser(t) && t.isDeleted);
      if (idx === -1) return false;
      this.data.transactions.splice(idx, 1);
      this.save();
      return true;
    }

    if (type === 'budgets') {
      const idx = this.data.budgets.findIndex(b => b.id === id && checkUser(b) && b.isDeleted);
      if (idx === -1) return false;
      this.data.budgets.splice(idx, 1);
      this.save();
      return true;
    }

    if (type === 'goals') {
      const idx = this.data.goals.findIndex(g => g.id === id && checkUser(g) && g.isDeleted);
      if (idx === -1) return false;
      this.data.goals.splice(idx, 1);
      this.save();
      return true;
    }

    return false;
  }

  public restoreUserData(userId: string, payload: {
    user: UserProfile;
    wallets: Wallet[];
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    notifications: Notification[];
  }) {
    if (!this.data.users) {
      this.data.users = [this.data.user];
    }
    
    // 1. Remove existing user profile if somehow present (or overwrite)
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.users.push(payload.user);

    // If it's the active fallback user, set it
    if (this.data.user.id === userId) {
      this.data.user = payload.user;
    }

    // 2. Overwrite wallets for this user
    this.data.wallets = this.data.wallets.filter(w => (w as any).userId !== userId);
    payload.wallets.forEach(w => {
      (w as any).userId = userId;
      this.data.wallets.push(w);
    });

    // 3. Overwrite categories
    payload.categories.forEach(c => {
      if (c.isCustom) {
        if (!this.data.categories.some(existingCat => existingCat.id === c.id)) {
          this.data.categories.push(c);
        }
      }
    });

    // 4. Overwrite transactions for this user
    this.data.transactions = this.data.transactions.filter(t => (t as any).userId !== userId);
    payload.transactions.forEach(t => {
      (t as any).userId = userId;
      this.data.transactions.push(t);
    });

    // 5. Overwrite budgets for this user
    this.data.budgets = this.data.budgets.filter(b => (b as any).userId !== userId);
    payload.budgets.forEach(b => {
      (b as any).userId = userId;
      this.data.budgets.push(b);
    });

    // 6. Overwrite goals for this user
    this.data.goals = this.data.goals.filter(g => (g as any).userId !== userId);
    payload.goals.forEach(g => {
      (g as any).userId = userId;
      this.data.goals.push(g);
    });

    // 7. Overwrite notifications for this user
    this.data.notifications = this.data.notifications.filter(n => (n as any).userId !== userId);
    payload.notifications.forEach(n => {
      (n as any).userId = userId;
      this.data.notifications.push(n);
    });

    this.save();
  }
}

export const db = new Database();
export default db;
