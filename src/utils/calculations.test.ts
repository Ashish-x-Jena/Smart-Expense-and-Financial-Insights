import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalSpent,
  calculateTotalInflow,
  calculateNetCashFlow,
  calculateSavingsRate,
  recalculateBudget,
  projectMonthEndSpend,
  simulateWhatIfSavings,
  findAnomalousTransactions,
  isLikelyDuplicate,
} from './calculations';
import { Transaction } from '../types/finance';

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    amount: 350,
    currency: 'INR',
    type: 'debit',
    merchant: 'Starbucks Coffee',
    category: 'Food & Dining',
    date: '2024-10-26T15:42:00Z',
    time: '03:42 PM',
    sourceType: 'upi',
    sourceProvider: 'Google Pay',
    status: 'verified',
    parsingConfidence: 98,
    excludedFromConsumption: false,
  },
  {
    id: 'tx-2',
    amount: 200,
    currency: 'INR',
    type: 'debit',
    merchant: 'Metro Rail Card',
    category: 'Transportation & Fuel',
    date: '2024-10-26T09:15:00Z',
    time: '09:15 AM',
    sourceType: 'manual',
    sourceProvider: 'Paytm Wallet',
    status: 'verified',
    parsingConfidence: 100,
    excludedFromConsumption: false,
  },
  {
    id: 'tx-3',
    amount: 5000,
    currency: 'INR',
    type: 'transfer',
    merchant: 'Transfer to Mom',
    category: 'Transfers & Remittance',
    date: '2024-10-23T10:05:00Z',
    time: '10:05 AM',
    sourceType: 'bank',
    sourceProvider: 'SBI UPI',
    status: 'verified',
    parsingConfidence: 95,
    excludedFromConsumption: true, // Crucial: excluded from consumption!
  },
  {
    id: 'tx-4',
    amount: 1499,
    currency: 'INR',
    type: 'refund',
    merchant: 'Zara Retail Refund',
    category: 'Refunds',
    date: '2024-10-25T11:00:00Z',
    time: '11:00 AM',
    sourceType: 'card',
    sourceProvider: 'Slice Card',
    status: 'verified',
    parsingConfidence: 96,
    excludedFromConsumption: true,
  },
  {
    id: 'tx-5',
    amount: 75000,
    currency: 'INR',
    type: 'credit',
    merchant: 'Monthly Salary Credit',
    category: 'Income',
    date: '2024-10-01T08:00:00Z',
    time: '08:00 AM',
    sourceType: 'bank',
    sourceProvider: 'HDFC Bank',
    status: 'verified',
    parsingConfidence: 100,
    excludedFromConsumption: false,
  },
  {
    id: 'tx-6',
    amount: 3200,
    currency: 'INR',
    type: 'debit',
    merchant: 'Croma Electronics',
    category: 'Shopping & Discretionary',
    date: '2024-10-20T14:00:00Z',
    time: '02:00 PM',
    sourceType: 'card',
    sourceProvider: 'HDFC Card',
    status: 'verified',
    parsingConfidence: 95,
    excludedFromConsumption: false,
  },
  {
    id: 'tx-7',
    amount: 800,
    currency: 'INR',
    type: 'debit',
    merchant: 'Miniso',
    category: 'Shopping & Discretionary',
    date: '2024-10-18T16:00:00Z',
    time: '04:00 PM',
    sourceType: 'card',
    sourceProvider: 'HDFC Card',
    status: 'verified',
    parsingConfidence: 95,
    excludedFromConsumption: false,
  },
];

test('calculateTotalSpent excludes transfers and refunds from consumption', () => {
  // Eligible debits: 350 (Starbucks) + 200 (Metro) + 3200 (Croma) + 800 (Miniso) = 4550
  // Transfer to Mom (5000) and Zara refund (1499) must NOT be counted as debit consumption
  const total = calculateTotalSpent(mockTransactions);
  assert.equal(total, 4550);
});

test('calculateTotalInflow correctly sums credits and refunds', () => {
  // 75000 (salary) + 1499 (refund) = 76499
  const inflow = calculateTotalInflow(mockTransactions);
  assert.equal(inflow, 76499);
});

test('calculateNetCashFlow calculates recorded income minus recorded expenses', () => {
  const net = calculateNetCashFlow(mockTransactions);
  assert.equal(net, 76499 - 4550);
});

test('calculateSavingsRate computes correct percentage', () => {
  const rate = calculateSavingsRate(100000, 40000);
  assert.equal(rate, 60);
});

test('recalculateBudget tracks thresholds and flags critical state at >=90%', () => {
  const result = recalculateBudget(13000, 12500, [50, 75, 90, 100]);
  assert.equal(result.remaining, 500);
  assert.equal(result.percentageConsumed, 96.2);
  assert.equal(result.thresholdBreached, 90);
  assert.equal(result.status, 'critical');
});

test('projectMonthEndSpend calculates trajectory correctly', () => {
  // 42,850 spent in 26 days -> daily rate ~1648 -> 31 days total
  const projection = projectMonthEndSpend(42850, 26, 31);
  assert.ok(projection.projectedTotal > 42850);
  assert.equal(projection.dailyRunRate, 1648);
});

test('simulateWhatIfSavings computes 20% dining reduction and annual wealth', () => {
  const sim = simulateWhatIfSavings(14250, 20);
  assert.equal(sim.monthlySavings, 2850);
  assert.equal(sim.annualWealth, 34200);
});

test('findAnomalousTransactions flags Croma transaction higher than shopping average', () => {
  const anomalies = findAnomalousTransactions(mockTransactions, 1.5);
  assert.ok(anomalies.some((tx) => tx.merchant === 'Croma Electronics'));
});

test('isLikelyDuplicate detects repeated charge within 24 hours', () => {
  const existing: Transaction[] = [
    {
      id: 'existing-1',
      amount: 349,
      currency: 'INR',
      type: 'debit',
      merchant: 'Netflix',
      category: 'Subscriptions',
      date: '2024-10-24T10:00:00Z',
      time: '10:00 AM',
      sourceType: 'upi',
      sourceProvider: 'Paytm UPI',
      status: 'verified',
      parsingConfidence: 95,
      excludedFromConsumption: false,
    },
  ];

  const candidate = {
    amount: 349,
    merchant: 'Netflix',
    date: '2024-10-25T08:00:00Z', // 22 hours later
  };

  const duplicate = isLikelyDuplicate(candidate, existing);
  assert.ok(duplicate);
  assert.equal(duplicate.id, 'existing-1');
});

test('proportional budget distribution sums exactly to target pool', () => {
  const currentLimits = [20000, 15000, 7000, 8000]; // total 50,000
  const currentSum = currentLimits.reduce((a, b) => a + b, 0);
  const targetPool = 75000;

  let allocated = 0;
  const newLimits = currentLimits.map((lim, idx) => {
    if (idx === currentLimits.length - 1) {
      return targetPool - allocated;
    }
    const slice = Math.round(((lim / currentSum) * targetPool) / 500) * 500;
    allocated += slice;
    return slice;
  });

  const sumNew = newLimits.reduce((a, b) => a + b, 0);
  assert.equal(sumNew, targetPool);
  assert.ok(newLimits[0] > 20000); // Housing scaled up
});

