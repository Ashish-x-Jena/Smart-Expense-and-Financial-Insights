import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface SettingsScreenProps {
  onOpenApprovedSenders: () => void;
  onOpenCsvModal: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenApprovedSenders,
  onOpenCsvModal,
}) => {
  const {
    userPreferences,
    updatePreferences,
    clearAllTransactions,
    resetDemoData,
    transactions,
    setSmsExplainerOpen,
  } = useFinance();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-24 md:pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#0d1c32] text-white px-5 py-2.5 rounded-full font-['Manrope'] text-xs font-bold shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Header Context */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#0b1c30] tracking-tight">
              Settings & Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86f2e4] text-[#006f66] font-['Manrope'] text-[10px] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
              Vault v2.4
            </span>
          </div>
          <p className="font-['Manrope'] text-xs text-[#44474d]">
            Data governance, device permissions & automated exports
          </p>
        </div>

        {/* 1. Profile & Account Summary Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white p-5 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
              <img
                src={userPreferences.avatarUrl}
                alt={userPreferences.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#006a61] ring-2 ring-[#0d1c32]"></div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-['Space_Grotesk'] text-base font-bold text-white truncate">
                  {userPreferences.name}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">
                  verified
                </span>
              </div>
              <span className="font-['Manrope'] text-xs text-[#76849f] truncate">
                {userPreferences.email}
              </span>
            </div>
          </div>

          {/* Security State Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md mb-4 w-full">
            <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">lock</span>
            <span className="font-['Manrope'] text-xs text-[#d6e3ff]">
              Local Storage + Zero-Cloud SMS Sync
            </span>
            <span className="ml-auto font-['Manrope'] text-[10px] text-[#89f5e7] font-bold">
              SECURE
            </span>
          </div>

          {/* Quick Account Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-1">
              <span className="font-['Manrope'] text-[10px] text-[#76849f] uppercase font-semibold">
                Primary Currency
              </span>
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-base font-bold text-white">
                  INR (₹)
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#76849f]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-1">
              <span className="font-['Manrope'] text-[10px] text-[#76849f] uppercase font-semibold">
                Fiscal Cycle
              </span>
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-base font-bold text-white">
                  1st / Mo
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#76849f]">
                  calendar_today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SMS Gateway & On-Device Privacy Controls */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                sms
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                SMS Gateway & Engine
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] font-['Manrope'] text-[10px] font-bold">
              <span className="material-symbols-outlined text-[12px]">bolt</span> Active
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Main Toggle */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Enable SMS Auto-Detection
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Live telemetry from verified bank dispatch
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={userPreferences.smsAutoDetect}
                  onChange={(e) => {
                    updatePreferences({ smsAutoDetect: e.target.checked });
                    showToast(e.target.checked ? 'SMS detection active' : 'SMS detection paused');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d1c32]"></div>
              </label>
            </div>

            {/* Privacy Architecture Guarantee Pill */}
            <div className="rounded-xl bg-[#eff4ff] p-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#006a61] mt-0.5">
                verified_user
              </span>
              <div className="flex flex-col">
                <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30]">
                  Strict On-Device Neural Parsing
                </span>
                <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5">
                  Raw SMS text never leaves local device memory. No cloud OCR or telemetry hops.
                </p>
              </div>
            </div>

            {/* Sub Toggle 1 */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Filter Non-Financial Senders
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Scans only verified alphanumeric banking masks (HDFCBK, SBIINB, PAYTM)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={userPreferences.filterNonFinancialSenders}
                  onChange={(e) => {
                    updatePreferences({ filterNonFinancialSenders: e.target.checked });
                    showToast(e.target.checked ? 'Sender filter enabled' : 'Sender filter disabled');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d1c32]"></div>
              </label>
            </div>

            {/* Quick Detail Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={onOpenApprovedSenders}
                className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors flex items-center justify-between text-left"
              >
                <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30] truncate">
                  12 Approved Senders
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#44474d]">
                  arrow_forward_ios
                </span>
              </button>
              <button
                onClick={onOpenApprovedSenders}
                className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors flex items-center justify-between text-left"
              >
                <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30] truncate">
                  Local Regex Rules
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#44474d]">
                  code
                </span>
              </button>
            </div>

            {/* Explain SMS Background Status Trigger */}
            <button
              onClick={() => setSmsExplainerOpen(true)}
              className="w-full p-3 rounded-xl bg-[#0d1c32] text-white hover:bg-[#213145] transition-all flex items-center justify-between shadow-sm active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                  help_outline
                </span>
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-white">
                    Explain SMS background status
                  </span>
                  <span className="font-['Manrope'] text-[10px] text-[#76849f]">
                    Sandbox limits, on-device neural parsing & Android daemon
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[#86f2e4] font-['Manrope'] text-[10px] font-bold">
                <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                <span>Enhancement</span>
              </span>
            </button>

            {/* Audit Log Trigger */}
            <button
              onClick={() => showToast('Parsed 74 records safely in local sandbox.')}
              className="w-full h-12 rounded-xl bg-[#eff4ff] text-[#0d1c32] hover:bg-[#e5eeff] transition-colors flex items-center justify-center gap-2 font-['Space_Grotesk'] text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Inspect SMS Parsing Logs (7 Days)</span>
            </button>
          </div>
        </div>

        {/* 3. Automated Export Rules & Data Pipelines */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                cloud_sync
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                Automated Export Rules
              </span>
            </div>
            <span className="font-['Manrope'] text-xs text-[#006a61] font-bold">Scheduled</span>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Monthly Export Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Monthly Statement Automation
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Dispatches generated reports on schedule
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input defaultChecked type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d1c32]"></div>
              </label>
            </div>

            {/* Export Format Chips */}
            <div className="flex flex-col gap-1.5">
              <span className="font-['Manrope'] text-[10px] text-[#44474d] uppercase font-bold tracking-wide">
                Export Payload Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['csv', 'pdf', 'json'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      updatePreferences({ monthlyExportFormat: fmt });
                      showToast(`Export format set to ${fmt.toUpperCase()}`);
                    }}
                    className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      userPreferences.monthlyExportFormat === fmt
                        ? 'bg-[#0d1c32] text-white shadow-sm'
                        : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {fmt === 'csv' ? 'table_chart' : fmt === 'pdf' ? 'picture_as_pdf' : 'key'}
                    </span>
                    <span className="capitalize">{fmt.toUpperCase()} Sheet</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cadence & Routing Details */}
            <div className="rounded-xl bg-[#eff4ff] p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[#0b1c30]">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  schedule
                </span>
                <span className="font-['Manrope'] text-xs font-bold">
                  1st of month at 08:00 AM IST
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#44474d]">
                <span className="material-symbols-outlined text-[16px]">folder_special</span>
                <span className="font-['Manrope'] text-xs">
                  Local Storage & Authenticated Google Drive
                </span>
              </div>
            </div>

            {/* Mask Account Identifiers Toggle */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Mask Account Identifiers
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Obfuscates card & account trails (e.g. Card XX4402)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={userPreferences.maskAccountIdentifiers}
                  onChange={(e) => {
                    updatePreferences({ maskAccountIdentifiers: e.target.checked });
                    showToast(e.target.checked ? 'Account numbers masked' : 'Masking disabled');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d1c32]"></div>
              </label>
            </div>

            {/* Immediate Ledger Action */}
            <button
              onClick={onOpenCsvModal}
              className="w-full h-12 rounded-xl bg-[#0d1c32] text-white hover:bg-[#213145] transition-colors flex items-center justify-center gap-2 shadow-sm font-['Space_Grotesk'] text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Export Full Ledger ({transactions.length} Records)</span>
            </button>
          </div>
        </div>

        {/* 4. Categorization & ML Engine */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                psychology
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                Categorization & ML Rules
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Merchant Auto-Mapping
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  24 active custom overrides registered
                </span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#44474d]">
                arrow_forward_ios
              </span>
            </div>

            <div className="w-full h-[1px] bg-slate-100"></div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Smart Suggestion Engine
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Predicts recurring expenses from spending rhythms
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input defaultChecked type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d1c32]"></div>
              </label>
            </div>

            <div className="w-full h-[1px] bg-slate-100"></div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Excluded Consumption Rules
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Refunds, self-transfers & credit card bills omit burn
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#e5eeff] font-['Manrope'] text-xs text-[#0b1c30] font-bold">
                3 Active
              </span>
            </div>
          </div>
        </div>

        {/* 5. Security, Compliance & Data Sovereignty */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                security
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                Security & Sovereignty
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Biometric Unlock */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0d1c32]">
                  <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                    Biometric Unlock
                  </span>
                  <span className="font-['Manrope'] text-xs text-[#44474d]">
                    FaceID / Fingerprint required on open
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={userPreferences.biometricLock}
                  onChange={(e) => {
                    updatePreferences({ biometricLock: e.target.checked });
                    showToast(e.target.checked ? 'Biometric lock enabled' : 'Biometric lock disabled');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d1c32]"></div>
              </label>
            </div>

            <div className="w-full h-[1px] bg-slate-100"></div>

            {/* Compliance Banner */}
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#006a61] mt-0.5">
                policy
              </span>
              <div className="flex flex-col">
                <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30]">
                  RBI Guidelines Compliant
                </span>
                <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5 leading-relaxed">
                  Strictly adheres to RBI Digital Lending and SMS privacy directives for non-custodial local finance management.
                </p>
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-100"></div>

            {/* Reset / Demo Data button */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetDemoData();
                  showToast('Demo data reloaded to baseline 74 records');
                }}
                className="flex-1 h-11 rounded-xl bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Demo Ledger</span>
              </button>
            </div>

            {/* Destructive Action Button */}
            {!deleteConfirmOpen ? (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-full h-11 rounded-xl bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center gap-2 transition-colors font-['Space_Grotesk'] text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>Delete All Local Transaction Data</span>
              </button>
            ) : (
              <div className="p-3 bg-[#ffdad6]/50 rounded-xl flex flex-col gap-2">
                <span className="font-['Manrope'] text-xs font-bold text-[#ba1a1a]">
                  Are you sure? This will clear all transactions from local memory.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      clearAllTransactions();
                      setDeleteConfirmOpen(false);
                      showToast('All transaction records cleared');
                    }}
                    className="flex-1 py-2 rounded-lg bg-[#ba1a1a] text-white font-['Manrope'] text-xs font-bold"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-white text-[#0b1c30] font-['Manrope'] text-xs font-bold border border-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Version Footer */}
        <div className="flex flex-col items-center justify-center gap-1 text-center pt-2 pb-6">
          <span className="font-['Manrope'] text-[11px] text-[#44474d] uppercase tracking-wider font-bold">
            Smart Expense v2.4.1 (Build 4480)
          </span>
          <span className="font-['Manrope'] text-xs text-[#75777e]">
            Zero-Knowledge Local Storage Engine
          </span>
        </div>
      </div>
    </div>
  );
};
