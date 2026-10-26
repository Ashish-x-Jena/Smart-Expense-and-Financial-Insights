import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Transaction,
  Category,
  Budget,
  SenderMask,
  RecurringExpense,
  FinancialNotification,
  UserPreferences,
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

  const clearBackgroundToast = () => setBackgroundToastMessage(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [transactions, budgets]);

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
