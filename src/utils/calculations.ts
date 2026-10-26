import { Transaction, Budget } from '../types/finance';

/**
 * Calculates total spent (debit) strictly excluding non-consumption transfers,
 * credit card bill payments, and reversals.
 */
export function calculateTotalSpent(transactions: Transaction[]): number {
  return transactions
    .filter(
      (tx) =>
        tx.type === 'debit' &&
        !tx.excludedFromConsumption &&
        tx.status === 'verified'
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculates total inflow (income, salary, refunds, credits).
 */
export function calculateTotalInflow(transactions: Transaction[]): number {
  return transactions
    .filter(
      (tx) =>
        (tx.type === 'credit' || tx.type === 'refund') &&
        tx.status !== 'duplicate'
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculates net cash flow (Inflow - Consumption Expenses).
 */
export function calculateNetCashFlow(transactions: Transaction[]): number {
  const inflow = calculateTotalInflow(transactions);
  const spent = calculateTotalSpent(transactions);
  return inflow - spent;
}

/**
 * Calculates savings rate percentage.
 * Returns 0 if income is zero or negative.
 */
export function calculateSavingsRate(inflow: number, spent: number): number {
  if (inflow <= 0) return 0;
  const netSavings = inflow - spent;
  if (netSavings <= 0) return 0;
  return Math.round((netSavings / inflow) * 100);
}

/**
 * Calculates budget consumption and remaining balances.
 */
export function recalculateBudget(
  limit: number,
  spent: number,
  activeThresholds: number[] = [50, 75, 90, 100]
): {
  remaining: number;
  percentageConsumed: number;
  thresholdBreached?: number;
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
} {
  const remaining = Math.max(0, limit - spent);
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const roundedPct = Math.round(percentage * 10) / 10;

  // Determine highest breached threshold
  const sortedThresholds = [...activeThresholds].sort((a, b) => b - a);
  const breached = sortedThresholds.find((t) => percentage >= t);

  let status: 'normal' | 'warning' | 'critical' | 'exceeded' = 'normal';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 90) {
    status = 'critical';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  return {
    remaining,
    percentageConsumed: roundedPct,
    thresholdBreached: breached,
    status,
  };
}

/**
 * Projects month-end spending based on current month-to-date spending
 * and days elapsed in the month.
 */
export function projectMonthEndSpend(
  mtdSpent: number,
  daysElapsed: number,
  totalDaysInMonth: number = 31
): { projectedTotal: number; dailyRunRate: number } {
  if (daysElapsed <= 0) {
    return { projectedTotal: mtdSpent, dailyRunRate: 0 };
  }
  const dailyRunRate = mtdSpent / daysElapsed;
  const remainingDays = Math.max(0, totalDaysInMonth - daysElapsed);
  const projectedTotal = Math.round(mtdSpent + dailyRunRate * remainingDays);

  return {
    projectedTotal,
    dailyRunRate: Math.round(dailyRunRate),
  };
}

/**
 * Simulates discretionary dining or shopping cut impact.
 * e.g., Cut discretionary spend by percentage -> calculates monthly & annual savings.
 */
export function simulateWhatIfSavings(
  baselineDiscretionarySpend: number,
  reductionPercentage: number
): { monthlySavings: number; annualWealth: number } {
  const clampedPct = Math.max(0, Math.min(100, reductionPercentage));
  const monthlySavings = Math.round(baselineDiscretionarySpend * (clampedPct / 100));
  const annualWealth = monthlySavings * 12;

  return { monthlySavings, annualWealth };
}

/**
 * Detects potential anomalies where a transaction is significantly higher
 * than the category or user average (e.g. > 2.2x the category average).
 */
export function findAnomalousTransactions(
  transactions: Transaction[],
  multiplier: number = 2.2
): Transaction[] {
  // Compute category averages for debits
  const categorySums: Record<string, { total: number; count: number }> = {};

  transactions
    .filter((tx) => tx.type === 'debit' && !tx.excludedFromConsumption)
    .forEach((tx) => {
      if (!categorySums[tx.category]) {
        categorySums[tx.category] = { total: 0, count: 0 };
      }
      categorySums[tx.category].total += tx.amount;
      categorySums[tx.category].count += 1;
    });

  return transactions.filter((tx) => {
    if (tx.type !== 'debit' || tx.excludedFromConsumption) return false;
    const stats = categorySums[tx.category];
    if (!stats || stats.count < 2) return false;
    const avg = stats.total / stats.count;
    return tx.amount >= avg * multiplier && tx.amount >= 1500;
  });
}

/**
 * Checks if a new transaction looks like a duplicate of an existing one
 * (same amount, same merchant, within 24 hours).
 */
export function isLikelyDuplicate(
  candidate: Pick<Transaction, 'merchant' | 'amount' | 'date'>,
  existingList: Transaction[]
): Transaction | undefined {
  const candidateDate = new Date(candidate.date).getTime();

  return existingList.find((tx) => {
    if (
      tx.merchant.toLowerCase().trim() ===
        candidate.merchant.toLowerCase().trim() &&
      Math.abs(tx.amount - candidate.amount) < 0.01
    ) {
      const txDate = new Date(tx.date).getTime();
      const diffHours = Math.abs(candidateDate - txDate) / (1000 * 60 * 60);
      return diffHours <= 24;
    }
    return false;
  });
}
