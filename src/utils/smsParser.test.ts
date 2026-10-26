import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFinancialSms } from './smsParser';

test('parses HDFC Airport Duty Free SMS correctly', () => {
  const sms = 'Spent INR 1,840.00 at BLR-AIRPORT-DUTYFREE on HDFC Card ending 4402 on 26-Oct-24 18:20:11. Ref: 429810.';
  const result = parseFinancialSms(sms, 'AD-HDFCBK');

  assert.equal(result.amount, 1840);
  assert.equal(result.type, 'debit');
  assert.equal(result.maskedAccount, 'Card ending 4402');
  assert.equal(result.referenceNo, '429810');
  assert.equal(result.sourceProvider, 'HDFC Bank');
  assert.ok(result.merchant.toLowerCase().includes('dutyfree'));
});

test('parses Netflix Paytm UPI SMS correctly', () => {
  const sms = 'Paid Rs 349 to Netflix Entertainment via Paytm UPI ref 994821 on 25-Oct-24.';
  const result = parseFinancialSms(sms, 'VK-PAYTM');

  assert.equal(result.amount, 349);
  assert.equal(result.type, 'debit');
  assert.equal(result.category, 'Subscriptions');
  assert.equal(result.sourceProvider, 'Paytm UPI');
  assert.equal(result.referenceNo, '994821');
});

test('parses refund SMS with positive refund type', () => {
  const sms = 'Refund of INR 1,499.00 from Zara Retail credited to Slice Card ending 8812 on 25-Oct-24.';
  const result = parseFinancialSms(sms, 'VK-SLICEC');

  assert.equal(result.amount, 1499);
  assert.equal(result.type, 'refund');
  assert.equal(result.category, 'Refunds');
});

test('parses low confidence truncated SMS and marks requiresReview: true', () => {
  const sms = 'Txn of 520.00 at TAPRI-CHAI-CORNER successful via PhonePe...';
  const result = parseFinancialSms(sms);

  assert.equal(result.amount, 520);
  assert.equal(result.type, 'debit');
  assert.equal(result.category, 'Food & Dining');
  assert.ok(result.confidence < 75);
  assert.equal(result.requiresReview, true);
});
