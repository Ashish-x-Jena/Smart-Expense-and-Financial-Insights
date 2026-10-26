import { Transaction, TransactionType } from '../types/finance';

export interface ParsedSmsResult {
  amount: number;
  type: TransactionType;
  merchant: string;
  category: string;
  sourceProvider: string;
  maskedAccount?: string;
  referenceNo?: string;
  confidence: number;
  rawText: string;
  requiresReview: boolean;
  reviewReason?: string;
}

const MERCHANT_CATEGORY_MAP: Record<string, string> = {
  starbucks: 'Food & Dining',
  zomato: 'Food & Dining',
  swiggy: 'Food & Dining',
  chai: 'Food & Dining',
  tapri: 'Food & Dining',
  cafe: 'Food & Dining',
  mcdonalds: 'Food & Dining',
  dominos: 'Food & Dining',
  subway: 'Food & Dining',
  restaurant: 'Food & Dining',

  metro: 'Transportation & Fuel',
  uber: 'Transportation & Fuel',
  ola: 'Transportation & Fuel',
  fuel: 'Transportation & Fuel',
  petrol: 'Transportation & Fuel',
  hpcl: 'Transportation & Fuel',
  bpcl: 'Transportation & Fuel',
  fastag: 'Transportation & Fuel',
  transit: 'Transportation & Fuel',

  apollo: 'Healthcare',
  pharmacy: 'Healthcare',
  medplus: 'Healthcare',
  hospital: 'Healthcare',
  clinic: 'Healthcare',

  netflix: 'Subscriptions',
  spotify: 'Subscriptions',
  prime: 'Subscriptions',
  hotstar: 'Subscriptions',
  youtube: 'Subscriptions',
  apple: 'Subscriptions',

  amazon: 'Shopping & Discretionary',
  flipkart: 'Shopping & Discretionary',
  myntra: 'Shopping & Discretionary',
  zara: 'Shopping & Discretionary',
  croma: 'Shopping & Discretionary',
  dutyfree: 'Shopping & Discretionary',

  rent: 'Housing & Utilities',
  electricity: 'Housing & Utilities',
  bescom: 'Housing & Utilities',
  broadband: 'Housing & Utilities',
  airtel: 'Housing & Utilities',
  jio: 'Housing & Utilities',

  salary: 'Income',
  dividend: 'Income',
  interest: 'Income',
};

/**
 * Extracts structured financial transaction data from a raw SMS alert.
 */
export function parseFinancialSms(
  rawText: string,
  senderMask?: string
): ParsedSmsResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Amount Extraction
  // Matches: INR 1,840.00 | Rs 349 | Rs. 520.00 | spent 350.00 | Txn of 520.00
  let amount = 0;
  const amountMatch =
    text.match(/(?:INR|Rs\.?|₹|Txn of)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/spent\s+(?:INR\s*)?([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/amount\s+(?:of\s+)?(?:INR\s*)?([\d,]+(?:\.\d{1,2})?)/i);

  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 2. Transaction Direction & Type
  let type: TransactionType = 'debit';
  if (lower.includes('refund') || lower.includes('reversed')) {
    type = 'refund';
  } else if (
    lower.includes('credited') ||
    lower.includes('received') ||
    lower.includes('cashback') ||
    lower.includes('salary')
  ) {
    type = 'credit';
  } else if (
    lower.includes('transfer to') ||
    lower.includes('sent to mom') ||
    lower.includes('remittance')
  ) {
    type = 'transfer';
  } else {
    type = 'debit';
  }

  // 3. Masked Account / Card Extraction
  let maskedAccount: string | undefined;
  const cardMatch =
    text.match(/(?:Card|ending|A\/c|a\/c)\s*(?:ending\s*)?([xX*]*\d{4})/i) ||
    text.match(/(?:A\/c\s*(?:no\.?\s*)?)[xX*]+(\d{4})/i);

  if (cardMatch && cardMatch[1]) {
    const last4 = cardMatch[1].slice(-4);
    if (lower.includes('card')) {
      maskedAccount = `Card ending ${last4}`;
    } else {
      maskedAccount = `A/c XX${last4}`;
    }
  }

  // 4. Reference Number Extraction
  let referenceNo: string | undefined;
  const refMatch =
    text.match(/(?:Ref|Ref no\.?|UTR|txnid|UPI ref)\s*:?\s*(\d{6,14})/i);
  if (refMatch && refMatch[1]) {
    referenceNo = refMatch[1];
  }

  // 5. Provider Extraction (HDFC, SBI, Paytm, PhonePe, ICICI, Slice, etc.)
  let sourceProvider = 'Bank Alert';
  if (senderMask) {
    const s = senderMask.toUpperCase();
    if (s.includes('HDFC')) sourceProvider = 'HDFC Bank';
    else if (s.includes('SBI')) sourceProvider = 'State Bank of India';
    else if (s.includes('PAYTM') || s.includes('PYTM')) sourceProvider = 'Paytm UPI';
    else if (s.includes('ICICI')) sourceProvider = 'ICICI Bank';
    else if (s.includes('AXIS')) sourceProvider = 'Axis Bank';
    else if (s.includes('SLICE')) sourceProvider = 'Slice Card';
    else sourceProvider = senderMask;
  } else if (lower.includes('paytm')) {
    sourceProvider = 'Paytm UPI';
  } else if (lower.includes('phonepe')) {
    sourceProvider = 'PhonePe UPI';
  } else if (lower.includes('hdfc')) {
    sourceProvider = 'HDFC Bank';
  } else if (lower.includes('sbi')) {
    sourceProvider = 'SBI UPI';
  } else if (lower.includes('icici')) {
    sourceProvider = 'ICICI Bank';
  } else if (lower.includes('slice')) {
    sourceProvider = 'Slice Card';
  } else if (lower.includes('gpay') || lower.includes('google pay')) {
    sourceProvider = 'Google Pay';
  }

  // 6. Merchant / Beneficiary Extraction
  let rawMerchant = 'Unknown Merchant';
  let cleanMerchant = 'Unknown Merchant';

  const atMatch = text.match(/(?:at|to|vpa)\s+([A-Za-z0-9\-_\s&'.]+?)(?:\s+(?:on|via|ref|using|dated|balance|Avl|$))/i);
  if (atMatch && atMatch[1]) {
    rawMerchant = atMatch[1].trim();
  }

  // Normalize merchant name
  cleanMerchant = rawMerchant
    .replace(/^([A-Z]{2}-)/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Special title-casing if all uppercase
  if (cleanMerchant === cleanMerchant.toUpperCase() && cleanMerchant.length > 2) {
    cleanMerchant = cleanMerchant
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // 7. Auto-Categorization
  let category = 'Other / Uncategorized';
  const merchantLower = cleanMerchant.toLowerCase();

  for (const [key, cat] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (merchantLower.includes(key) || lower.includes(key)) {
      category = cat;
      break;
    }
  }

  if (type === 'refund') {
    category = 'Refunds';
  } else if (type === 'transfer') {
    category = 'Transfers & Remittance';
  }

  // 8. Confidence Calculation
  let confidence = 35;
  if (amount > 0) confidence += 20;
  if (cleanMerchant !== 'Unknown Merchant') {
    confidence += (category !== 'Other / Uncategorized') ? 20 : 5;
  }
  if (maskedAccount) confidence += 15;
  if (referenceNo) confidence += 10;
  
  // Penalties
  if (!maskedAccount) confidence -= 10;
  if (lower.includes('...') || lower.includes('…')) confidence -= 20; // truncated text
  if (category === 'Other / Uncategorized') confidence -= 15;

  confidence = Math.max(15, Math.min(100, confidence));

  const requiresReview =
    confidence < 75 ||
    category === 'Other / Uncategorized' ||
    cleanMerchant === 'Unknown Merchant';

  let reviewReason: string | undefined;
  if (confidence < 50) reviewReason = 'Low confidence / unmapped merchant';
  else if (category === 'Other / Uncategorized') reviewReason = 'Ambiguous category';
  else if (confidence < 75) reviewReason = 'Uncertain format';

  return {
    amount,
    type,
    merchant: cleanMerchant,
    category,
    sourceProvider,
    maskedAccount,
    referenceNo,
    confidence,
    rawText,
    requiresReview,
    reviewReason,
  };
}
