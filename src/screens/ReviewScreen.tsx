import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export const ReviewScreen: React.FC = () => {
  const {
    unverifiedQueue,
    approveTransaction,
    mergeDuplicate,
    approveAllInQueue,
    parseAndAddSms,
    deleteTransaction,
    backgroundSmsListening,
    setBackgroundSmsListening,
    triggerBackgroundSmsSimulation,
    backgroundToastMessage,
    setSmsExplainerOpen,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'review' | 'flagged' | 'resolved'>('review');
  const [testSmsInput, setTestSmsInput] = useState('');
  const [testSenderMask, setTestSenderMask] = useState('AD-HDFCBK');
  const [testDrawerOpen, setTestDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Card 1 local state
  const [dutyFreeCategory, setDutyFreeCategory] = useState('Travel & Transit');
  const [dutyFreeReimbursable, setDutyFreeReimbursable] = useState(false);

  // Card 3 local state
  const [tapriMerchantName, setTapriMerchantName] = useState('Tapri Chai Corner');
  const [tapriCategory, setTapriCategory] = useState('Food & Dining');
  const [rememberTapriRule, setRememberTapriRule] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTestSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSmsInput.trim()) return;

    const result = parseAndAddSms(testSmsInput.trim(), testSenderMask);
    setTestSmsInput('');
    setTestDrawerOpen(false);
    showToast(
      `SMS parsed! Extracted ₹${result.amount} at ${result.merchant} (${result.parsingConfidence}% confidence)`
    );
  };

  const handleSimulateInboundSms = () => {
    const newTx = triggerBackgroundSmsSimulation();
    showToast(
      `Inbound SMS captured in background: ₹${newTx.amount} at ${newTx.merchant} (${newTx.sourceProvider})`
    );
  };

  const hasReviewItems = unverifiedQueue.length > 0;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-28 md:pb-16">
      {/* Toast */}
      {(toastMessage || backgroundToastMessage) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#0d1c32] text-white px-5 py-2.5 rounded-full font-['Manrope'] text-xs font-bold shadow-xl z-50 flex items-center gap-2 animate-bounce border border-[#86f2e4]/30">
          <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">
            notifications_active
          </span>
          <span>{toastMessage || backgroundToastMessage}</span>
        </div>
      )}

      {/* Telemetry & Device Privacy Shield */}
      <div className="pt-1 pb-3 flex flex-col gap-3">
        <div className="bg-[#eff4ff] rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  backgroundSmsListening ? 'bg-[#006a61] animate-pulse' : 'bg-[#ffb95f]'
                }`}
              ></span>
              <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30]">
                {backgroundSmsListening
                  ? 'Automatic SMS Parser Daemon: Active in Background'
                  : 'Automatic SMS Parser Daemon: Suspended'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Manrope'] text-[11px] text-[#44474d] font-semibold bg-[#e5eeff] px-2.5 py-0.5 rounded-full">
                {backgroundSmsListening ? 'Live Engine' : 'Paused'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={backgroundSmsListening}
                  onChange={(e) => {
                    setBackgroundSmsListening(e.target.checked);
                    showToast(
                      e.target.checked
                        ? 'Background SMS listening resumed'
                        : 'Background SMS listening suspended'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006a61]"></div>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/90 rounded-xl p-3 border border-slate-100">
            <span className="material-symbols-outlined text-[20px] text-[#006a61] shrink-0 mt-0.5">
              verified_user
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-['Space_Grotesk'] text-xs text-[#0b1c30] font-bold tracking-wide">
                100% On-Device Neural Parsing
              </p>
              <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5 leading-relaxed">
                Bank SMS texts are processed locally in secure memory. Raw SMS content never touches external cloud servers, adhering to RBI privacy directives.
              </p>
            </div>
          </div>

          {/* Background Ingestion Simulation Actions */}
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <button
              onClick={handleSimulateInboundSms}
              className="flex-1 min-w-[200px] h-10 px-3.5 rounded-xl bg-[#006a61] text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#005049] transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[17px] text-[#86f2e4]">
                bolt
              </span>
              <span>Simulate Inbound Bank SMS Now</span>
            </button>

            <button
              onClick={() => setTestDrawerOpen(true)}
              className="h-10 px-3.5 rounded-xl bg-[#0d1c32] text-white font-['Manrope'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#213145] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">
                input
              </span>
              <span>Paste Custom SMS</span>
            </button>
          </div>
        </div>

        {/* Explain SMS Background Status Card - Matched with uploaded UI reference */}
        <div
          onClick={() => setSmsExplainerOpen(true)}
          className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white p-4 sm:p-5 shadow-md border border-slate-700/50 cursor-pointer hover:border-[#86f2e4]/50 hover:shadow-lg transition-all active:scale-[0.99] group"
        >
          {/* Background Ambient Sparkles Motif */}
          <div className="absolute right-4 bottom-2 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
            <span className="material-symbols-outlined text-[64px]">auto_awesome</span>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Explain SMS background status
                </h3>
                <p className="font-['Manrope'] text-xs text-[#76849f] mt-0.5">
                  Understand on-device local parsing, Web sandbox safety & native Android daemon
                </p>
              </div>

              <span className="material-symbols-outlined text-[20px] text-[#86f2e4] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 font-['Manrope'] text-xs font-semibold text-[#89f5e7]">
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                <span>Enhancement</span>
              </span>

              <span className="font-['Manrope'] text-[11px] text-[#76849f]">
                Tap to read technical architecture &gt;
              </span>
            </div>
          </div>
        </div>

        {/* Review Status Header Info */}
        <div className="flex items-center justify-between mt-1 px-1">
          <div>
            <p className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30]">
              Unverified Queue
            </p>
            <p className="font-['Manrope'] text-xs text-[#44474d]">
              {unverifiedQueue.length} low-confidence transactions require your review
            </p>
          </div>
          <button
            onClick={() =>
              showToast('Transactions with confidence <75% or unmapped merchants require confirmation')
            }
            aria-label="Parsing Guidelines"
            className="w-8 h-8 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#44474d] hover:text-[#0b1c30] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
          </button>
        </div>

        {/* Segmented Tab Selector */}
        <div className="flex p-1 bg-[#e5eeff] rounded-xl gap-1 max-w-sm">
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-1.5 text-center rounded-lg font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'review'
                ? 'bg-white text-[#0b1c30] shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            <span>Needs Review</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#0d1c32] text-white font-['Manrope'] text-[10px]">
              {unverifiedQueue.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`flex-1 py-1.5 text-center rounded-lg font-['Manrope'] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'flagged'
                ? 'bg-white text-[#0b1c30] shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            <span>Flagged</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
              1
            </span>
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex-1 py-1.5 text-center rounded-lg font-['Manrope'] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'resolved'
                ? 'bg-white text-[#0b1c30] shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            <span>Resolved</span>
            <span className="text-[#44474d] text-[10px]">18</span>
          </button>
        </div>
      </div>

      {/* Review Cards Stream */}
      <div className="flex flex-col gap-6 pb-6">
        {!hasReviewItems ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-[#006a61] mb-2">
              task_alt
            </span>
            <p className="font-['Space_Grotesk'] font-bold text-lg text-[#0b1c30]">
              Review Queue is Completely Clear!
            </p>
            <p className="font-['Manrope'] text-sm text-[#44474d] mt-1">
              All parsed SMS transactions have been verified and reconciled into your ledger.
            </p>
          </div>
        ) : (
          <>
            {/* Card 1: Ambiguous Category & Airport Duty Free */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffddb8] text-[#2a1700]">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-wider">
                    Confidence: 62% • Ambiguous Category
                  </span>
                </div>
                <span className="font-['Manrope'] text-xs text-[#44474d]">Card Ending 4402</span>
              </div>

              {/* Raw SMS Snippet Pill */}
              <div className="bg-[#eff4ff] p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-1.5 mb-1 text-[#44474d]">
                  <span className="material-symbols-outlined text-[14px]">sms</span>
                  <span className="font-['Manrope'] text-[10px] uppercase font-bold">
                    Bank SMS Excerpt
                  </span>
                </div>
                <p className="font-['Manrope'] text-xs text-[#0b1c30] font-mono tracking-tight leading-relaxed select-all">
                  "Spent INR 1,840.00 at BLR-AIRPORT-DUTYFREE on HDFC Card ending 4402 on 26-Oct-24 18:20:11. Ref: 429810."
                </p>
              </div>

              {/* Parsed Editable Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col">
                  <span className="font-['Manrope'] text-[11px] text-[#44474d]">Detected Amount</span>
                  <span className="font-['Space_Grotesk'] text-lg sm:text-xl text-[#0b1c30] font-bold mt-0.5 tabular-nums">
                    ₹1,840.00
                  </span>
                </div>
                <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col">
                  <span className="font-['Manrope'] text-[11px] text-[#44474d]">Transaction Time</span>
                  <span className="font-['Manrope'] text-sm sm:text-base text-[#0b1c30] font-semibold mt-0.5">
                    26 Oct, 6:20 PM
                  </span>
                </div>
              </div>

              {/* Merchant Correction Suggestion */}
              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Cleaned Merchant Label
                </label>
                <div className="flex items-center justify-between p-3 bg-[#eff4ff] rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                      store
                    </span>
                    <span className="font-['Manrope'] text-sm text-[#0b1c30] font-bold truncate">
                      Bengaluru Airport Duty Free
                    </span>
                  </div>
                  <span className="font-['Manrope'] text-[10px] text-[#006a61] font-bold px-2 py-0.5 bg-[#86f2e4] rounded-md">
                    Auto-Cleaned
                  </span>
                </div>
              </div>

              {/* Category Selector Chips */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Select Verified Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Travel & Transit', 'Shopping & Discretionary', 'Food & Dining'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDutyFreeCategory(cat)}
                      className={`px-3 py-1.5 rounded-full font-['Manrope'] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                        dutyFreeCategory === cat
                          ? 'bg-[#0d1c32] text-white'
                          : 'bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {cat === 'Travel & Transit' ? 'flight' : cat === 'Food & Dining' ? 'restaurant' : 'shopping_bag'}
                      </span>
                      <span>{cat}</span>
                      {dutyFreeCategory === cat && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Reimbursement Switch */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#eff4ff] cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#44474d]">
                    corporate_fare
                  </span>
                  <div className="flex flex-col">
                    <span className="font-['Manrope'] text-xs text-[#0b1c30] font-bold">
                      Mark as Business / Reimbursable
                    </span>
                    <span className="font-['Manrope'] text-[10px] text-[#44474d]">
                      Excludes from personal monthly discretionary budget
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dutyFreeReimbursable}
                  onChange={(e) => setDutyFreeReimbursable(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#006a61] cursor-pointer"
                />
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    approveTransaction('tx-queue-1', {
                      category: dutyFreeCategory,
                      isReimbursable: dutyFreeReimbursable,
                      excludedFromConsumption: dutyFreeReimbursable,
                    });
                    showToast('Airport Duty Free confirmed and posted to ledger!');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-sm font-semibold shadow-md active:scale-[0.99] transition-transform flex items-center justify-center gap-2 hover:bg-[#213145]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                    done_all
                  </span>
                  <span>Confirm & Post ₹1,840</span>
                </button>
                <button
                  onClick={() => {
                    deleteTransaction('tx-queue-1');
                    showToast('Transaction discarded');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#e5eeff] text-[#44474d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors flex items-center justify-center"
                  aria-label="Discard transaction"
                >
                  <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                </button>
              </div>
            </div>

            {/* Card 2: Duplicate Alert & Subscription Reversal */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-wider">
                    Confidence: 74% • Possible Duplicate (2x in 24h)
                  </span>
                </div>
                <span className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  UPI / Paytm
                </span>
              </div>

              {/* Raw SMS Snippet */}
              <div className="bg-[#eff4ff] p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-1.5 mb-1 text-[#44474d]">
                  <span className="material-symbols-outlined text-[14px]">sms</span>
                  <span className="font-['Manrope'] text-[10px] uppercase font-bold">
                    Incoming SMS Body
                  </span>
                </div>
                <p className="font-['Manrope'] text-xs text-[#0b1c30] font-mono tracking-tight leading-relaxed">
                  "Paid Rs 349 to Netflix Entertainment via Paytm UPI ref 994821 on 25-Oct-24."
                </p>
              </div>

              {/* Reconciliation Conflict Info */}
              <div className="p-3 bg-[#e5eeff] rounded-xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#0d1c32] mt-0.5">
                  content_copy
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30]">
                    Matched Existing Ledger Entry
                  </p>
                  <p className="font-['Manrope'] text-xs text-[#44474d] mt-1 leading-snug">
                    Identical charge of <span className="font-bold text-[#0b1c30]">₹349.00</span> was already posted on 24-Oct from Auto-Debit mandate.
                  </p>
                </div>
              </div>

              {/* Duplicate Handling Tri-Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    mergeDuplicate('tx-queue-2');
                    showToast('Merged duplicate with existing Oct 24 charge');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-['Manrope'] text-xs font-bold hover:bg-[#e5eeff] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                      merge
                    </span>
                    <span>Merge & Deduplicate with Oct 24</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                <button
                  onClick={() => {
                    approveTransaction('tx-queue-2', { status: 'verified' });
                    showToast('Posted as separate legitimate 2nd transaction');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-['Manrope'] text-xs font-semibold hover:bg-[#e5eeff] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#44474d]">
                      add_circle_outline
                    </span>
                    <span>Keep as Separate (Legitimate 2nd Charge)</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                <button
                  onClick={() => {
                    approveTransaction('tx-queue-2', {
                      type: 'refund',
                      category: 'Refunds',
                      excludedFromConsumption: true,
                    });
                    showToast('Flagged as Refund / Reversal');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#eff4ff] text-[#44474d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/20 font-['Manrope'] text-xs font-semibold transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      currency_exchange
                    </span>
                    <span>Mark as Refund / Failed Reversal</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Card 3: Low Confidence & Truncated Format */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[14px]">priority_high</span>
                  <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-wider">
                    Confidence: 48% • Unmapped Merchant
                  </span>
                </div>
                <span className="font-['Manrope'] text-xs text-[#44474d]">PhonePe Gateway</span>
              </div>

              {/* Raw SMS Snippet */}
              <div className="bg-[#eff4ff] p-3 rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-1.5 mb-1 text-[#44474d]">
                  <span className="material-symbols-outlined text-[14px]">sms</span>
                  <span className="font-['Manrope'] text-[10px] uppercase font-bold">
                    Raw Truncated Text
                  </span>
                </div>
                <p className="font-['Manrope'] text-xs text-[#0b1c30] font-mono tracking-tight leading-relaxed">
                  "Txn of 520.00 at TAPRI-CHAI-CORNER successful via PhonePe..."
                </p>
              </div>

              {/* Quick Correction Form */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                    Merchant Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tapriMerchantName}
                      onChange={(e) => setTapriMerchantName(e.target.value)}
                      className="w-full h-11 px-3 bg-[#eff4ff] rounded-xl font-['Manrope'] text-sm font-semibold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006a61]"
                    />
                    <span className="material-symbols-outlined text-[18px] text-[#44474d] absolute right-3 top-3">
                      edit
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                      Category
                    </label>
                    <select
                      value={tapriCategory}
                      onChange={(e) => setTapriCategory(e.target.value)}
                      className="h-11 px-3 bg-[#eff4ff] rounded-xl font-['Manrope'] text-xs font-semibold text-[#0b1c30] outline-none cursor-pointer"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Groceries & Essentials">Groceries & Essentials</option>
                      <option value="Shopping & Discretionary">Shopping</option>
                      <option value="Transportation & Fuel">Transportation</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                      Type
                    </label>
                    <div className="h-11 px-3 bg-[#eff4ff] rounded-xl flex items-center font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                      Debit (Expense)
                    </div>
                  </div>
                </div>

                {/* Future Automation Rule */}
                <label className="flex items-start gap-2 p-3 rounded-xl bg-[#eff4ff] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={rememberTapriRule}
                    onChange={(e) => setRememberTapriRule(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-[#006a61] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-['Manrope'] text-xs text-[#0b1c30] font-bold">
                      Remember Auto-Rule
                    </span>
                    <span className="font-['Manrope'] text-[10px] text-[#44474d] leading-snug">
                      Always map "TAPRI-CHAI-CORNER" to Food & Dining in future scans
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    approveTransaction('tx-queue-3', {
                      merchant: tapriMerchantName,
                      category: tapriCategory,
                    });
                    showToast('Saved rule & posted ₹520 to ledger!');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-sm font-semibold shadow-md active:scale-[0.99] transition-transform flex items-center justify-center gap-2 hover:bg-[#213145]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                    check_circle
                  </span>
                  <span>Save Rule & Post ₹520</span>
                </button>
                <button
                  onClick={() => {
                    deleteTransaction('tx-queue-3');
                    showToast('Discarded unverified transaction');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#e5eeff] text-[#44474d] hover:text-[#ba1a1a] transition-colors flex items-center justify-center"
                  aria-label="Block transaction"
                >
                  <span className="material-symbols-outlined text-[20px]">block</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Batch Verification Utility */}
      {hasReviewItems && (
        <div className="fixed bottom-16 lg:bottom-4 left-0 right-0 p-4 z-40 max-w-md mx-auto pointer-events-none">
          <div className="flex items-center justify-between bg-[#0d1c32] text-white p-3.5 rounded-2xl shadow-2xl pointer-events-auto border border-white/10">
            <div className="flex items-center gap-2.5 pl-1">
              <span className="material-symbols-outlined text-[22px] text-[#86f2e4]">
                auto_awesome
              </span>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-xs font-bold text-white leading-tight">
                  Batch Parser Ready
                </span>
                <span className="font-['Manrope'] text-[10px] text-[#b9c7e4]">
                  Apply smart suggestions to queue
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                approveAllInQueue();
                showToast('All queued transactions approved and reconciled!');
              }}
              className="py-2 px-3.5 bg-[#86f2e4] text-[#00201d] rounded-xl font-['Manrope'] text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
            >
              <span>Approve All</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Test SMS Ingestion Modal Drawer */}
      {testDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-6 flex flex-col gap-4 shadow-2xl max-w-lg mx-auto w-full animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                  terminal
                </span>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30]">
                  Live SMS Ingestion Diagnostic
                </h3>
              </div>
              <button
                onClick={() => setTestDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#44474d] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleTestSmsSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Sender DLT Header
                </label>
                <select
                  value={testSenderMask}
                  onChange={(e) => setTestSenderMask(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-mono text-xs font-bold"
                >
                  <option value="AD-HDFCBK">AD-HDFCBK (HDFC Bank)</option>
                  <option value="AX-SBIINB">AX-SBIINB (State Bank of India)</option>
                  <option value="VK-PAYTM">VK-PAYTM (Paytm UPI)</option>
                  <option value="JM-ICICIB">JM-ICICIB (ICICI Bank)</option>
                  <option value="VK-SLICEC">VK-SLICEC (Slice Card)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Paste Raw SMS Body
                </label>
                <textarea
                  rows={3}
                  required
                  value={testSmsInput}
                  onChange={(e) => setTestSmsInput(e.target.value)}
                  placeholder='e.g. "Spent INR 780.00 at Blue Tokai Coffee on HDFC Card ending 4402 on 26-Oct-24 16:30. Ref 109283."'
                  className="p-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#006a61]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setTestSmsInput(
                      'Spent INR 950.00 at McDonald\'s on HDFC Card ending 4402 on 26-Oct-24. Ref: 881290.'
                    )
                  }
                  className="text-[10px] font-bold text-[#006a61] bg-[#86f2e4]/30 px-2.5 py-1 rounded-md"
                >
                  Load Sample Fast Food SMS
                </button>
              </div>

              <button
                type="submit"
                className="h-11 bg-[#0d1c32] text-white rounded-xl font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                  smart_toy
                </span>
                <span>Ingest & Parse On-Device</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
