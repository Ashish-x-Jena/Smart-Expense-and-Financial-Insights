export type TransactionType = 'debit' | 'credit' | 'transfer' | 'refund' | 'reversal';

export type TransactionSourceType = 'sms' | 'upi' | 'card' | 'bank' | 'manual' | 'csv';

export type TransactionStatus = 'verified' | 'needs_review' | 'flagged' | 'duplicate';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string;
  category: string;
  subCategory?: string;
  date: string; // ISO string or readable format
  time: string;
  sourceType: TransactionSourceType;
  sourceProvider: string; // e.g., 'Google Pay', 'PhonePe', 'HDFC Bank', 'Paytm', 'Slice Card'
  maskedAccount?: string; // e.g., 'Card XX4402', 'A/c XX9012'
  referenceNo?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  status: TransactionStatus;
  parsingConfidence: number; // 0 - 100
  rawSmsBody?: string;
  excludedFromConsumption: boolean; // true for transfers, card payments, refunds to avoid double counting
  isReimbursable?: boolean;
  balanceAfter?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'essential' | 'discretionary' | 'savings' | 'transfer';
  monthlyAllocation: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  icon: string;
  subtext: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageConsumed: number;
  thresholdBreached?: number; // 50, 75, 90, 100
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
}

export interface SenderMask {
  id: string;
  mask: string;
  name: string;
  category: 'bank' | 'wallet' | 'credit';
  observedPrefixes: string[];
  regexPattern: string;
  isEnabled: boolean;
  capturedCount: number;
}

export interface RecurringExpense {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextExpectedDate: string;
  category: string;
  source: string;
  isActive: boolean;
  isIdle?: boolean;
}

export interface FinancialNotification {
  id: string;
  type: 'budget_threshold' | 'anomaly' | 'duplicate' | 'recurring' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface UserPreferences {
  name: string;
  email: string;
  avatarUrl: string;
  currency: string;
  currencySymbol: string;
  fiscalCycleStartDay: number;
  smsAutoDetect: boolean;
  strictLocalParsing: boolean;
  filterNonFinancialSenders: boolean;
  maskAccountIdentifiers: boolean;
  autoWhitelistVerifiedSenders: boolean;
  biometricLock: boolean;
  quietHours: string;
  activeThresholds: number[]; // e.g. [50, 75, 90, 100]
  monthlyExportFormat: 'csv' | 'pdf' | 'json';
}
