import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, TransactionSourceType } from '../types/finance';

export const QuickAddModal: React.FC = () => {
  const {
    quickAddOpen,
    setQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    categories,
  } = useFinance();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('debit');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [sourceProvider, setSourceProvider] = useState('Google Pay');
  const [sourceType, setSourceType] = useState<TransactionSourceType>('upi');
  const [notes, setNotes] = useState('');
  const [excludedFromConsumption, setExcludedFromConsumption] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setMerchant(editingTransaction.merchant);
      setCategory(editingTransaction.category);
      setSourceProvider(editingTransaction.sourceProvider);
      setSourceType(editingTransaction.sourceType);
      setNotes(editingTransaction.notes || '');
      setExcludedFromConsumption(editingTransaction.excludedFromConsumption);
      setIsRecurring(!!editingTransaction.isRecurring);
    } else {
      setAmount('');
      setType('debit');
      setMerchant('');
      setCategory('Food & Dining');
      setSourceProvider('Google Pay');
      setSourceType('upi');
      setNotes('');
      setExcludedFromConsumption(false);
      setIsRecurring(false);
    }
  }, [editingTransaction, quickAddOpen]);

  if (!quickAddOpen && !editingTransaction) return null;

  const handleClose = () => {
    setQuickAddOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!merchant.trim()) return;

    const now = new Date();
    const dateStr = now.toISOString();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        amount: parsedAmount,
        type,
        merchant: merchant.trim(),
        category,
        sourceProvider,
        sourceType,
        notes: notes.trim(),
        excludedFromConsumption: type === 'transfer' || type === 'refund' ? true : excludedFromConsumption,
        isRecurring,
      });
    } else {
      addTransaction({
        amount: parsedAmount,
        currency: 'INR',
        type,
        merchant: merchant.trim(),
        category,
        date: dateStr,
        time: timeStr,
        sourceType,
        sourceProvider,
        notes: notes.trim(),
        excludedFromConsumption: type === 'transfer' || type === 'refund' ? true : excludedFromConsumption,
        isRecurring,
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#213145]/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#ffffff] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Centered Logo & Title Header */}
        <div className="relative flex flex-col items-center justify-center text-center pt-2 pb-3 border-b border-slate-100">
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#44474d] hover:text-[#0b1c30] transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Centered Manual Record Transaction Logo */}
          <div className="w-14 h-14 rounded-2xl bg-[#0d1c32] text-white flex items-center justify-center shadow-lg mb-2 ring-4 ring-[#86f2e4]/25">
            <span className="material-symbols-outlined text-[28px] text-[#86f2e4]">
              {editingTransaction ? 'edit_note' : 'receipt_long'}
            </span>
          </div>

          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30]">
            {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
          </h3>
          <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5">
            {editingTransaction
              ? 'Update ledger details and category allocations'
              : 'Manual Expense & Inflow Entry'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount input */}
          <div className="flex flex-col gap-1">
            <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-['Space_Grotesk'] text-lg font-bold text-[#44474d]">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-8 pr-4 bg-[#eff4ff] rounded-xl font-['Space_Grotesk'] text-xl font-bold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006a61]"
              />
            </div>
          </div>

          {/* Transaction Type Segmented Switch */}
          <div className="flex flex-col gap-1">
            <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
              Transaction Direction / Type
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#eff4ff] rounded-xl text-center text-xs font-['Manrope'] font-bold">
              {[
                { id: 'debit', label: 'Expense' },
                { id: 'credit', label: 'Inflow' },
                { id: 'transfer', label: 'Transfer' },
                { id: 'refund', label: 'Refund' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id as TransactionType);
                    if (t.id === 'transfer' || t.id === 'refund') {
                      setExcludedFromConsumption(true);
                    }
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    type === t.id
                      ? 'bg-[#0d1c32] text-white shadow-sm'
                      : 'text-[#44474d] hover:text-[#0b1c30]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant / Description */}
          <div className="flex flex-col gap-1">
            <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
              Merchant or Description
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Starbucks, Zomato, Rent Transfer..."
              className="h-11 px-3.5 bg-[#eff4ff] rounded-xl font-['Manrope'] text-sm font-semibold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006a61]"
            />
          </div>

          {/* Category & Payment Source Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 px-3 bg-[#eff4ff] rounded-xl font-['Manrope'] text-xs font-semibold text-[#0b1c30] outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                Payment Channel
              </label>
              <select
                value={sourceProvider}
                onChange={(e) => {
                  setSourceProvider(e.target.value);
                  if (e.target.value.includes('Card')) setSourceType('card');
                  else if (e.target.value.includes('Cash')) setSourceType('manual');
                  else setSourceType('upi');
                }}
                className="h-11 px-3 bg-[#eff4ff] rounded-xl font-['Manrope'] text-xs font-semibold text-[#0b1c30] outline-none cursor-pointer"
              >
                <option value="Google Pay">Google Pay</option>
                <option value="PhonePe UPI">PhonePe UPI</option>
                <option value="Paytm Wallet">Paytm Wallet</option>
                <option value="HDFC Debit Card">HDFC Debit Card</option>
                <option value="Slice Credit Card">Slice Credit Card</option>
                <option value="SBI UPI">SBI UPI</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Cash / Manual">Cash / Manual</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with room partner"
              className="h-10 px-3 bg-[#eff4ff] rounded-xl font-['Manrope'] text-xs text-[#0b1c30] outline-none"
            />
          </div>

          {/* Excluded from consumption toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#eff4ff] cursor-pointer">
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30]">
                Exclude from Consumption
              </span>
              <span className="font-['Manrope'] text-[10px] text-[#44474d]">
                Prevents double-counting transfers, refunds, or credit card repayments
              </span>
            </div>
            <input
              type="checkbox"
              checked={excludedFromConsumption}
              onChange={(e) => setExcludedFromConsumption(e.target.checked)}
              className="w-4 h-4 rounded accent-[#006a61]"
            />
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="h-12 bg-[#0d1c32] text-white rounded-xl font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#213145] active:scale-95 transition-all shadow-md mt-1"
          >
            <span className="material-symbols-outlined text-[20px] text-[#86f2e4]">save</span>
            <span>{editingTransaction ? 'Save Changes' : 'Record Transaction'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
