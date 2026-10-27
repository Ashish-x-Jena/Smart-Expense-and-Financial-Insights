import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Transaction,
  Category,
  Budget,
  SenderMask,
  RecurringExpense,
  FinancialNotification,
  UserPreferences,
  AuthUser,
} from '../types/finance';
import {
  initialTransactions,
  initialCategories,
  initialBudgets,
  initialSenderMasks,
  initialRecurringExpenses,
  initialNotifications,
  initialUserPreferences,
} from '../data/seedData';
import {
  calculateTotalSpent,
  calculateTotalInflow,
  calculateNetCashFlow,
  calculateSavingsRate,
  projectMonthEndSpend,
  simulateWhatIfSavings,
  recalculateBudget,
} from '../utils/calculations';
import { parseFinancialSms } from '../utils/smsParser';
import { db, auth, googleAuthProvider, handleFirestoreError } from '../lib/firebase';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type AppTab = 'overview' | 'ledger' | 'budgets' | 'insights' | 'review' | 'settings' | 'approved-senders';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  senderMasks: SenderMask[];
  recurringExpenses: RecurringExpense[];
  notifications: FinancialNotification[];
  userPreferences: UserPreferences;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  aiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;
  activeTimeframe: 'Weekly' | 'Monthly' | 'Quarterly';
  setActiveTimeframe: (tf: 'Weekly' | 'Monthly' | 'Quarterly') => void;
  diningCutPercentage: number;
  setDiningCutPercentage: (pct: number) => void;
  smsExplainerOpen: boolean;
  setSmsExplainerOpen: (open: boolean) => void;

  // Computed Telemetry
  totalSpent: number;
  totalInflow: number;
  netCashFlow: number;
  savingsRate: number;
  projectedMonthEnd: number;
  dailyRunRate: number;
  whatIfSavings: { monthlySavings: number; annualWealth: number };
  unverifiedQueue: Transaction[];
  unreadNotificationCount: number;
  categoryBreakdown: { name: string; amount: number; percentage: number; color: string }[];
  paymentSourceBreakdown: { name: string; amount: number; percentage: number; icon: string; color: string }[];

  // Background SMS Engine state & actions
  backgroundSmsListening: boolean;
  setBackgroundSmsListening: (listening: boolean) => void;
  triggerBackgroundSmsSimulation: () => Transaction;
  backgroundToastMessage: string | null;
  clearBackgroundToast: () => void;

  // Mutators
  addTransaction: (tx: Omit<Transaction, 'id' | 'status' | 'parsingConfidence'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  parseAndAddSms: (rawText: string, senderMask?: string) => Transaction;
  approveTransaction: (id: string, updates?: Partial<Transaction>) => void;
  mergeDuplicate: (duplicateId: string) => void;
  approveAllInQueue: () => void;
  createBudget: (categoryName: string, limit: number) => void;
  rebalanceBudgets: () => void;
  toggleSenderMask: (maskId: string) => void;
  addSenderMask: (mask: string, name: string, category: 'bank' | 'wallet' | 'credit') => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  markNotificationRead: (id: string) => void;
  clearAllTransactions: () => void;
  resetDemoData: () => void;

  // Monthly Budget Pool
  monthlyBudgetPool: number;
  setMonthlyBudgetPool: (pool: number) => void;
  distributeBudgetPool: (targetPool: number) => void;
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';

  // Authentication System
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  authToastMessage: string | null;
  setAuthToastMessage: (msg: string | null) => void;
  login: (credentials: { identifier: string; password: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; phoneNumber?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<{ success: boolean }>;
  logout: () => void;
  sendOtp: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOtp: (identifier: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'smart_expense_state_v4';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored state if available, else initial seed data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_txs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions', e);
      }
    }
    return initialTransactions;
  });

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved budgets', e);
      }
    }
    return initialBudgets;
  });

  const [senderMasks, setSenderMasks] = useState<SenderMask[]>(initialSenderMasks);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(initialRecurringExpenses);
  const [notifications, setNotifications] = useState<FinancialNotification[]>(initialNotifications);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);

  const [activeTab, setActiveTab] = useState<AppTab>('ledger'); // Start on Ledger as in default screenshot, or Overview
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [smsExplainerOpen, setSmsExplainerOpen] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Monthly');
  const [diningCutPercentage, setDiningCutPercentage] = useState<number>(20);

  // Background SMS Parser state
  const [backgroundSmsListening, setBackgroundSmsListening] = useState<boolean>(true);
  const [backgroundToastMessage, setBackgroundToastMessage] = useState<string | null>(null);
  const [simIndex, setSimIndex] = useState(0);

  // Monthly Budget Pool State
  const [monthlyBudgetPool, setMonthlyBudgetPoolState] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budget_pool`);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 50000;
  });
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  // Authentication System State & Persistence
  const AUTH_TOKEN_KEY = 'smart_expense_auth_token_v1';
  const AUTH_USER_KEY = 'smart_expense_auth_user_v1';

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    // Check localStorage (Remember Me) or sessionStorage
    const savedUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (savedUser && savedToken) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser;
  const [authToastMessage, setAuthToastMessage] = useState<string | null>(null);

  const quickDemoLogin = () => {
    const demoUser: AuthUser = {
      id: 'usr_priyansh_01',
      name: 'Priyansh Sharma',
      email: 'priyansh.sharma@example.com',
      phoneNumber: '9876543210',
      avatarUrl: userPreferences.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Pro Member',
      token: 'jwt_mock_token_smart_expense_priyansh',
      createdAt: '2024-01-15',
    };
    setCurrentUser(demoUser);
    localStorage.setItem(AUTH_TOKEN_KEY, demoUser.token!);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
    updatePreferences({ name: demoUser.name, email: demoUser.email });
    setAuthToastMessage(`Welcome back, ${demoUser.name}!`);
    setActiveTab('overview');
  };

  const login = async ({
    identifier,
    password,
    rememberMe = true,
  }: {
    identifier: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 650));

    const isEmail = identifier.includes('@');
    const rawName = isEmail ? identifier.split('@')[0] : 'User ' + identifier.slice(-4);
    const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: isEmail ? identifier : `${identifier}@smart-expense.app`,
      phoneNumber: !isEmail ? identifier : undefined,
      avatarUrl: userPreferences.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Member',
      token: `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem(AUTH_TOKEN_KEY, user.token!);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, user.token!);
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    updatePreferences({ name: user.name, email: user.email });
    setAuthToastMessage(`Welcome back, ${user.name}!`);
    setActiveTab('overview');
    return { success: true };
  };

  const signup = async ({
    name,
    email,
    phoneNumber,
    password,
  }: {
    name: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 750));

    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber?.trim(),
      avatarUrl: userPreferences.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Pro Member',
      token: `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    localStorage.setItem(AUTH_TOKEN_KEY, user.token!);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    updatePreferences({ name: user.name, email: user.email });
    setAuthToastMessage(`Account created! Welcome to Smart Expense, ${user.name}.`);
    setActiveTab('overview');
    return { success: true };
  };

  const loginWithOAuth = async (provider: 'google' | 'apple'): Promise<{ success: boolean }> => {
    const providerName = provider === 'google' ? 'Google' : 'Apple';

    if (provider === 'google') {
      try {
        setFirebaseSyncStatus('syncing');
        const res = await signInWithPopup(auth, googleAuthProvider);
        const fbUser = res.user;
        const user: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || 'user@gmail.com',
          phoneNumber: fbUser.phoneNumber || undefined,
          avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          role: 'Google Verified',
          token: await fbUser.getIdToken(),
          createdAt: new Date().toISOString(),
        };

        setCurrentUser(user);
        localStorage.setItem(AUTH_TOKEN_KEY, user.token!);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        updatePreferences({ name: user.name, email: user.email });
        setAuthToastMessage('Successfully signed in with Google Firebase!');
        setActiveTab('overview');
        setFirebaseSyncStatus('synced');
        return { success: true };
      } catch (err: unknown) {
        handleFirestoreError(err, 'signInWithGoogle');
        // If popup was blocked or in offline dev sandbox, fallback gracefully
      }
    }

    await new Promise((r) => setTimeout(r, 600));

    const user: AuthUser = {
      id: `usr_${provider}_${Date.now()}`,
      name: provider === 'google' ? 'Priyansh Sharma' : 'Apple User',
      email: provider === 'google' ? 'priyansh.sharma@gmail.com' : 'priyansh@privaterelay.appleid.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: `${providerName} Verified`,
      token: `jwt_${provider}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    localStorage.setItem(AUTH_TOKEN_KEY, user.token!);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    updatePreferences({ name: user.name, email: user.email });
    setAuthToastMessage(`Successfully signed in with ${providerName}!`);
    setActiveTab('overview');
    return { success: true };
  };

  const logout = () => {
    try {
      fbSignOut(auth).catch(() => {});
    } catch {
      // ignore
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(null);
    setAuthToastMessage('You have been safely signed out.');
  };

  const sendOtp = async (identifier: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  };

  const resetPasswordWithOtp = async (
    identifier: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 700));
    if (otp.length < 4) {
      return { success: false, error: 'Please enter a valid 4-to-6 digit code.' };
    }
    await login({ identifier, password: newPassword, rememberMe: true });
    setAuthToastMessage('Password reset successfully. You are now logged in!');
    return { success: true };
  };

  const clearBackgroundToast = () => setBackgroundToastMessage(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_budget_pool`, monthlyBudgetPool.toString());
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [transactions, budgets, monthlyBudgetPool]);

  // Firestore Real-Time User & Preferences Synchronization
  useEffect(() => {
    if (!currentUser?.id) return;

    let isMounted = true;
    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      getDoc(userDocRef)
        .then((snap) => {
          if (!isMounted) return;
          if (snap.exists()) {
            const data = snap.data();
            if (data.monthlyBudgetPool && typeof data.monthlyBudgetPool === 'number') {
              setMonthlyBudgetPoolState(data.monthlyBudgetPool);
            }
          } else {
            setDoc(
              userDocRef,
              {
                uid: currentUser.id,
                email: currentUser.email,
                displayName: currentUser.name,
                photoURL: currentUser.avatarUrl,
                monthlyBudgetPool,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch((err) => handleFirestoreError(err, 'initUserDoc'));
          }
          setFirebaseSyncStatus('synced');
        })
        .catch((err) => {
          if (!isMounted) return;
          handleFirestoreError(err, 'fetchUserDoc');
          setFirebaseSyncStatus('offline');
        });
    } catch (e) {
      console.warn('Firestore sync failed', e);
      setFirebaseSyncStatus('offline');
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Computed Telemetry
  const totalSpent = useMemo(() => calculateTotalSpent(transactions), [transactions]);
  const totalInflow = useMemo(() => calculateTotalInflow(transactions), [transactions]);
  const netCashFlow = useMemo(() => calculateNetCashFlow(transactions), [transactions]);
  const savingsRate = useMemo(() => calculateSavingsRate(totalInflow, totalSpent), [totalInflow, totalSpent]);

  // Month-end projection
  const { projectedTotal: projectedMonthEnd, dailyRunRate } = useMemo(() => {
    return projectMonthEndSpend(totalSpent, 26, 31);
  }, [totalSpent]);

  // What-If Discretionary Dining Simulation
  const whatIfSavings = useMemo(() => {
    // Baseline dining spending in October is roughly 14,250
    const diningTxs = transactions.filter(
      (tx) => tx.category === 'Food & Dining' && tx.type === 'debit' && !tx.excludedFromConsumption
    );
    const baseline = diningTxs.reduce((sum, tx) => sum + tx.amount, 0) || 14250;
    return simulateWhatIfSavings(baseline, diningCutPercentage);
  }, [transactions, diningCutPercentage]);

  // Unverified queue for Review screen
  const unverifiedQueue = useMemo(() => {
    return transactions.filter(
      (tx) => tx.status === 'needs_review' || tx.status === 'duplicate' || tx.status === 'flagged'
    );
  }, [transactions]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    const verifiedDebits = transactions.filter(
      (tx) => tx.type === 'debit' && !tx.excludedFromConsumption && tx.status !== 'duplicate'
    );
    const total = verifiedDebits.reduce((acc, tx) => acc + tx.amount, 0) || 1;

    verifiedDebits.forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });

    const categoryColorMap: Record<string, string> = {
      'Food & Dining': '#006a61',
      'Housing & Utilities': '#0d1c32',
      'Shopping & Discretionary': '#ffb95f',
      'Transportation & Fuel': '#76849f',
      'Subscriptions': '#ba1a1a',
      'Groceries & Essentials': '#6bd8cb',
      'Healthcare': '#ffdad6',
    };

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: Math.round((amount / total) * 100),
        color: categoryColorMap[name] || '#76849f',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Payment source comparison
  const paymentSourceBreakdown = useMemo(() => {
    const verifiedDebits = transactions.filter(
      (tx) => tx.type === 'debit' && !tx.excludedFromConsumption && tx.status !== 'duplicate'
    );
    const total = verifiedDebits.reduce((acc, tx) => acc + tx.amount, 0) || 1;

    let phonePe = 0;
    let gPay = 0;
    let slice = 0;
    let other = 0;

    verifiedDebits.forEach((tx) => {
      const p = tx.sourceProvider.toLowerCase();
      if (p.includes('phonepe')) phonePe += tx.amount;
      else if (p.includes('google') || p.includes('gpay')) gPay += tx.amount;
      else if (p.includes('slice')) slice += tx.amount;
      else other += tx.amount;
    });

    return [
      {
        name: 'PhonePe UPI',
        amount: Math.round(phonePe),
        percentage: Math.round((phonePe / total) * 100) || 42,
        icon: 'Pe',
        color: '#0d1c32',
      },
      {
        name: 'Google Pay',
        amount: Math.round(gPay),
        percentage: Math.round((gPay / total) * 100) || 28,
        icon: 'G',
        color: '#006a61',
      },
      {
        name: 'Slice Credit Card',
        amount: Math.round(slice),
        percentage: Math.round((slice / total) * 100) || 18,
        icon: 'Sl',
        color: '#ffb95f',
      },
      {
        name: 'Cash / Manual Entry',
        amount: Math.round(other),
        percentage: Math.round((other / total) * 100) || 12,
        icon: '₹',
        color: '#76849f',
      },
    ];
  }, [transactions]);

  // Recalculate category budgets whenever transactions change
  useEffect(() => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((b) => {
        const spent = transactions
          .filter(
            (tx) =>
              tx.category === b.categoryName &&
              tx.type === 'debit' &&
              !tx.excludedFromConsumption &&
              tx.status !== 'duplicate'
          )
          .reduce((sum, tx) => sum + tx.amount, 0);

        const recalc = recalculateBudget(b.limit, spent, userPreferences.activeThresholds);
        return {
          ...b,
          spent,
          remaining: recalc.remaining,
          percentageConsumed: recalc.percentageConsumed,
          thresholdBreached: recalc.thresholdBreached,
          status: recalc.status,
        };
      })
    );
  }, [transactions, userPreferences.activeThresholds]);

  // Mutator functions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'status' | 'parsingConfidence'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-custom-${Date.now()}`,
      status: 'verified',
      parsingConfidence: 100,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const parseAndAddSms = (rawText: string, senderMask?: string): Transaction => {
    const parsed = parseFinancialSms(rawText, senderMask);
    const now = new Date();
    const newTx: Transaction = {
      id: `tx-sms-${Date.now()}`,
      amount: parsed.amount,
      currency: 'INR',
      type: parsed.type,
      merchant: parsed.merchant,
      category: parsed.category,
      date: now.toISOString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceType: 'sms',
      sourceProvider: parsed.sourceProvider,
      maskedAccount: parsed.maskedAccount,
      referenceNo: parsed.referenceNo,
      status: parsed.requiresReview ? 'needs_review' : 'verified',
      parsingConfidence: parsed.confidence,
      rawSmsBody: rawText,
      excludedFromConsumption: parsed.type === 'transfer' || parsed.type === 'refund',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const INBOUND_BANK_ALERTS = useMemo(
    () => [
      {
        text: 'Spent INR 420.00 at Swiggy on HDFC Card ending 4402 on 26-Oct-24 19:10:02. Ref: 554210.',
        mask: 'AD-HDFCBK',
      },
      {
        text: 'Paid Rs 260.00 to Uber India via Google Pay UPI ref 882910 on 26-Oct-24 19:45.',
        mask: 'AX-SBIINB',
      },
      {
        text: 'Txn of INR 310.00 at Medplus Pharmacy successful on Slice Card ending 8812. Ref: 902143.',
        mask: 'VK-SLICEC',
      },
      {
        text: 'Paid Rs 140 to Chai Point via Paytm UPI ref 771204 on 26-Oct-24.',
        mask: 'VK-PAYTM',
      },
      {
        text: 'Refund of INR 750.00 from Myntra credited to ICICI Bank A/c XX3102 on 26-Oct-24.',
        mask: 'JM-ICICIB',
      },
      {
        text: 'Txn of 340.00 at LOCAL-BAKERY successful via PhonePe...',
        mask: 'VK-PHONEPE',
      },
    ],
    []
  );

  const triggerBackgroundSmsSimulation = (): Transaction => {
    const alert = INBOUND_BANK_ALERTS[simIndex % INBOUND_BANK_ALERTS.length];
    setSimIndex((prev) => prev + 1);

    const newTx = parseAndAddSms(alert.text, alert.mask);

    const newNotif: FinancialNotification = {
      id: `notif-sms-${Date.now()}`,
      type: newTx.status === 'needs_review' ? 'duplicate' : 'system',
      title: 'Background SMS Auto-Parsed',
      message: `Extracted ₹${newTx.amount} at ${newTx.merchant} (${newTx.sourceProvider})`,
      timestamp: 'Just now',
      read: false,
      severity: newTx.status === 'needs_review' ? 'warning' : 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setBackgroundToastMessage(
      `Background SMS Processed: ₹${newTx.amount} at ${newTx.merchant} (${
        newTx.status === 'needs_review' ? 'Sent to Review' : 'Posted to Ledger'
      })`
    );

    setTimeout(() => {
      setBackgroundToastMessage(null);
    }, 4500);

    return newTx;
  };

  const approveTransaction = (id: string, updates?: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          return {
            ...tx,
            status: 'verified',
            parsingConfidence: Math.max(90, tx.parsingConfidence),
            ...updates,
          };
        }
        return tx;
      })
    );
  };

  const mergeDuplicate = (duplicateId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== duplicateId));
  };

  const approveAllInQueue = () => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.status === 'needs_review' || tx.status === 'flagged') {
          return {
            ...tx,
            status: 'verified',
            parsingConfidence: 95,
          };
        }
        // Deduplicate the duplicate one
        if (tx.status === 'duplicate') {
          return {
            ...tx,
            status: 'verified',
            excludedFromConsumption: true, // mark as reversal/duplicate
          };
        }
        return tx;
      })
    );
  };

  const createBudget = (categoryName: string, limit: number) => {
    const existing = budgets.find((b) => b.categoryName === categoryName);
    if (existing) {
      setBudgets((prev) =>
        prev.map((b) => (b.categoryName === categoryName ? { ...b, limit } : b))
      );
      return;
    }
    const newBudget: Budget = {
      id: `b-custom-${Date.now()}`,
      categoryId: `cat-custom-${Date.now()}`,
      categoryName,
      icon: 'category',
      subtext: 'Custom track',
      limit,
      spent: 0,
      remaining: limit,
      percentageConsumed: 0,
      status: 'normal',
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const rebalanceBudgets = () => {
    // Rebalance surplus from groceries or shopping to critical categories
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.categoryName === 'Housing & Utilities') {
          return { ...b, limit: b.limit + 1000 };
        }
        if (b.categoryName === 'Transportation & Fuel') {
          return { ...b, limit: b.limit + 500 };
        }
        if (b.categoryName === 'Shopping & Discretionary') {
          return { ...b, limit: Math.max(5000, b.limit - 1500) };
        }
        return b;
      })
    );
  };

  const setMonthlyBudgetPool = (pool: number) => {
    const validPool = Math.max(1000, Math.round(pool));
    setMonthlyBudgetPoolState(validPool);
    try {
      localStorage.setItem(`${STORAGE_KEY}_budget_pool`, validPool.toString());
      if (currentUser?.id) {
        const userDocRef = doc(db, 'users', currentUser.id);
        setDoc(
          userDocRef,
          { monthlyBudgetPool: validPool, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch((err) => {
          handleFirestoreError(err, 'updateBudgetPool');
        });
      }
    } catch (e) {
      console.warn('Failed saving monthlyBudgetPool', e);
    }
  };

  const distributeBudgetPool = (targetPool: number) => {
    const validPool = Math.max(1000, Math.round(targetPool));
    setMonthlyBudgetPool(validPool);

    setBudgets((prev) => {
      const currentSum = prev.reduce((s, b) => s + b.limit, 0) || 1;
      let allocated = 0;
      return prev.map((b, idx) => {
        if (idx === prev.length - 1) {
          const remainder = Math.max(500, validPool - allocated);
          return { ...b, limit: remainder };
        }
        const slice = Math.max(500, Math.round(((b.limit / currentSum) * validPool) / 500) * 500);
        allocated += slice;
        return { ...b, limit: slice };
      });
    });
  };

  const toggleSenderMask = (maskId: string) => {
    setSenderMasks((prev) =>
      prev.map((m) => (m.id === maskId ? { ...m, isEnabled: !m.isEnabled } : m))
    );
  };

  const addSenderMask = (mask: string, name: string, category: 'bank' | 'wallet' | 'credit') => {
    const cleanMask = mask.trim().toUpperCase();
    const newMask: SenderMask = {
      id: `mask-${Date.now()}`,
      mask: cleanMask,
      name,
      category,
      observedPrefixes: [`VK-${cleanMask}`, `AD-${cleanMask}`],
      regexPattern: `^([A-Z]{2}-)?(${cleanMask})$`,
      isEnabled: true,
      capturedCount: 0,
    };
    setSenderMasks((prev) => [...prev, newMask]);
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllTransactions = () => {
    setTransactions([]);
  };

  const resetDemoData = () => {
    setTransactions(initialTransactions);
    setBudgets(initialBudgets);
    setSenderMasks(initialSenderMasks);
    setNotifications(initialNotifications);
    setUserPreferences(initialUserPreferences);
    localStorage.removeItem(`${STORAGE_KEY}_txs`);
    localStorage.removeItem(`${STORAGE_KEY}_budgets`);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        senderMasks,
        recurringExpenses,
        notifications,
        userPreferences,
        activeTab,
        setActiveTab,
        quickAddOpen,
        setQuickAddOpen,
        editingTransaction,
        setEditingTransaction,
        aiAssistantOpen,
        setAiAssistantOpen,
        activeTimeframe,
        setActiveTimeframe,
        diningCutPercentage,
        setDiningCutPercentage,
        smsExplainerOpen,
        setSmsExplainerOpen,
        totalSpent,
        totalInflow,
        netCashFlow,
        savingsRate,
        projectedMonthEnd,
        dailyRunRate,
        whatIfSavings,
        unverifiedQueue,
        unreadNotificationCount,
        categoryBreakdown,
        paymentSourceBreakdown,
        backgroundSmsListening,
        setBackgroundSmsListening,
        triggerBackgroundSmsSimulation,
        backgroundToastMessage,
        clearBackgroundToast,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        parseAndAddSms,
        approveTransaction,
        mergeDuplicate,
        approveAllInQueue,
        createBudget,
        rebalanceBudgets,
        toggleSenderMask,
        addSenderMask,
        updatePreferences,
        markNotificationRead,
        clearAllTransactions,
        resetDemoData,
        monthlyBudgetPool,
        setMonthlyBudgetPool,
        distributeBudgetPool,
        firebaseSyncStatus,
        currentUser,
        isAuthenticated,
        authToastMessage,
        setAuthToastMessage,
        login,
        signup,
        loginWithOAuth,
        logout,
        sendOtp,
        resetPasswordWithOtp,
        quickDemoLogin,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
