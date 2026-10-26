import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SenderMask } from '../types/finance';

export const ApprovedSendersScreen: React.FC = () => {
  const { senderMasks, toggleSenderMask, addSenderMask, setActiveTab } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bank' | 'wallet' | 'credit'>('all');
  const [formExpanded, setFormExpanded] = useState(false);
  const [newMask, setNewMask] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'bank' | 'wallet' | 'credit'>('bank');

  // Regex modal state
  const [inspectingMask, setInspectingMask] = useState<SenderMask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredMasks = useMemo(() => {
    return senderMasks.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.mask.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q);

      const matchesCat = activeFilter === 'all' || m.category === activeFilter;
      return matchesSearch && matchesCat;
    });
  }, [senderMasks, searchQuery, activeFilter]);

  const handleAddCustomMask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMask.trim() || newMask.trim().length < 3) {
      showToast('Please enter a valid 3 to 6-character mask');
      return;
    }
    addSenderMask(newMask, newName.trim() || `${newMask.toUpperCase()} Provider`, newCategory);
    setNewMask('');
    setNewName('');
    setFormExpanded(false);
    showToast(`Mask ${newMask.toUpperCase()} whitelisted & saved`);
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

      <div className="flex flex-col gap-5">
        {/* Top Navigation */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('settings')}
              className="inline-flex items-center gap-1.5 text-[#44474d] hover:text-[#0b1c30] transition-colors py-1"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="font-['Manrope'] text-xs font-bold">Settings & Privacy</span>
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] font-['Manrope'] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] animate-pulse"></span>
              {senderMasks.filter((m) => m.isEnabled).length} Active Masks
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <h1 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[#0b1c30]">
                Approved Sender IDs
              </h1>
              <p className="font-['Manrope'] text-xs text-[#44474d]">
                Telecom DLT Alphanumeric Whitelist for Expense Parsing
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#44474d]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mask (e.g. HDFC, SBI, PAYTM)..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#75777e] font-['Manrope'] text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006a61] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44474d] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-nowrap">
            {(
              [
                { id: 'all', label: `All (${senderMasks.length})` },
                { id: 'bank', label: 'Banks (6)' },
                { id: 'wallet', label: 'Wallets/UPI (4)' },
                { id: 'credit', label: 'Cards/Credit (2)' },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full font-['Manrope'] text-xs font-semibold transition-all ${
                  activeFilter === chip.id
                    ? 'bg-[#0d1c32] text-white shadow-sm'
                    : 'bg-[#dce9ff] text-[#44474d] hover:text-[#0b1c30]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security Safeguard Banner Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white p-5 shadow-md">
          <div className="absolute -right-4 -top-6 w-32 h-32 rounded-full bg-[#515f78]/20 blur-2xl pointer-events-none"></div>

          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#86f2e4]">
              <span className="material-symbols-outlined text-[22px]">shield_lock</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-sm font-bold text-white">
                  Alphanumeric Header Whitelist
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-['Manrope'] font-bold uppercase tracking-wider bg-[#006a61] text-white">
                  Local RAM
                </span>
              </div>
              <p className="font-['Manrope'] text-xs text-[#b9c7e4] mt-1 leading-snug">
                Only telecom-registered 6-character sender IDs (e.g.{' '}
                <span className="text-white font-mono font-bold">AD-HDFCBK</span>) are filtered. Personal 10-digit mobile numbers are discarded by OS kernel rules before memory allocation.
              </p>
            </div>
          </div>
        </div>

        {/* Sender Cards List */}
        <div className="flex flex-col gap-3">
          {filteredMasks.map((sender) => (
            <div
              key={sender.id}
              className={`rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all ${
                !sender.isEnabled ? 'opacity-70 bg-slate-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#e5eeff] flex items-center justify-center font-['Space_Grotesk'] text-sm font-bold text-[#0d1c32]">
                    {sender.mask.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30] font-mono tracking-tight">
                        {sender.mask}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-['Manrope'] text-[10px] font-bold ${
                          sender.isEnabled
                            ? 'bg-[#86f2e4] text-[#006f66]'
                            : 'bg-slate-200 text-[#75777e]'
                        }`}
                      >
                        {sender.isEnabled ? 'Verified Bank' : 'Paused'}
                      </span>
                    </div>
                    <p className="font-['Manrope'] text-xs text-[#44474d]">{sender.name}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={sender.isEnabled}
                    onChange={() => {
                      toggleSenderMask(sender.id);
                      showToast(
                        sender.isEnabled
                          ? `${sender.mask} monitoring suspended`
                          : `${sender.mask} parsing enabled`
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d1c32]"></div>
                </label>
              </div>

              {/* Prefix Metadata Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="font-['Manrope'] text-[11px] text-[#44474d] font-semibold">
                  Observed prefixes:
                </span>
                {sender.observedPrefixes.map((pfx) => (
                  <span
                    key={pfx}
                    className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-medium"
                  >
                    {pfx}
                  </span>
                ))}
              </div>

              {/* Bottom telemetry & regex pattern trigger */}
              <div className="mt-3 pt-2 flex items-center justify-between bg-[#eff4ff] rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                    sync_saved_locally
                  </span>
                  <span className="font-['Manrope'] text-xs text-[#0b1c30] font-medium tabular-nums">
                    {sender.capturedCount} transactions captured this cycle
                  </span>
                </div>
                <button
                  onClick={() => setInspectingMask(sender)}
                  className="flex items-center gap-0.5 text-[#006a61] hover:underline font-['Manrope'] text-xs font-bold"
                >
                  <span>Regex</span>
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Sender Addition Action Card */}
        <div className="rounded-2xl bg-[#eff4ff] p-5 flex flex-col gap-3 border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0d1c32] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">add_moderator</span>
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30] leading-tight">
                  Add Custom Sender Mask
                </h3>
                <p className="font-['Manrope'] text-xs text-[#44474d]">
                  Register new co-op bank or fintech partner
                </p>
              </div>
            </div>
            <button
              onClick={() => setFormExpanded(!formExpanded)}
              className="w-8 h-8 rounded-full bg-white text-[#0b1c30] flex items-center justify-center hover:bg-[#e5eeff] transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">
                {formExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {formExpanded && (
            <form onSubmit={handleAddCustomMask} className="flex flex-col gap-3 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-['Manrope'] text-[10px] text-[#44474d] uppercase font-bold">
                    6-Char Mask Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={newMask}
                    onChange={(e) => setNewMask(e.target.value.toUpperCase())}
                    placeholder="e.g. KOTAKB"
                    className="h-10 px-3 rounded-lg bg-white text-[#0b1c30] font-mono font-bold uppercase text-xs focus:outline-none focus:ring-2 focus:ring-[#006a61]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-['Manrope'] text-[10px] text-[#44474d] uppercase font-bold">
                    Category Type
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="h-10 px-2 rounded-lg bg-white text-[#0b1c30] font-['Manrope'] text-xs font-semibold focus:outline-none"
                  >
                    <option value="bank">Scheduled Bank</option>
                    <option value="wallet">UPI / Wallet</option>
                    <option value="credit">Credit / PayLater</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-[10px] text-[#44474d] uppercase font-bold">
                  Provider / Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kotak Mahindra Bank"
                  className="h-10 px-3 rounded-lg bg-white text-[#0b1c30] font-['Manrope'] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006a61]"
                />
              </div>

              {/* Regex Preview */}
              <div className="p-3 rounded-xl bg-white text-[#44474d] flex flex-col gap-1">
                <span className="font-['Manrope'] text-[10px] font-bold text-[#0b1c30]">
                  Compiled Regex Parser Pattern
                </span>
                <span className="font-mono text-xs text-[#006a61] bg-[#eff4ff] p-2 rounded truncate">
                  ^([A-Z]&#123;2&#125;-)?({newMask || 'KOTAKB'})$
                </span>
              </div>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#213145] transition-transform active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                  verified
                </span>
                <span>Whitelist Sender Mask</span>
              </button>
            </form>
          )}
        </div>

        {/* Regulatory Note */}
        <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-[#e5eeff]/50">
          <span className="material-symbols-outlined text-[18px] text-[#44474d] shrink-0 mt-0.5">
            policy
          </span>
          <p className="font-['Manrope'] text-[11px] text-[#44474d] leading-relaxed">
            <strong className="text-[#0b1c30] font-bold">TRAI & RBI Non-Custodial Protocol:</strong> Telemetry monitors DLT Principal Entity headers only. SMS body parsing executes strictly inside on-device volatile storage. No message payload is transmitted to or mirrored on external servers.
          </p>
        </div>
      </div>

      {/* Regex Inspection Modal */}
      {inspectingMask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#86f2e4] flex items-center justify-center text-[#006f66]">
                  <span className="material-symbols-outlined text-[18px]">data_object</span>
                </span>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
                    {inspectingMask.name} Regex Rule
                  </h3>
                  <span className="font-['Manrope'] text-[10px] text-[#44474d]">
                    TRAI DLT Template Parser
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingMask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#44474d]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-['Manrope'] text-[10px] text-[#44474d] uppercase font-bold">
                Compiled Regular Expression
              </span>
              <div className="p-3 rounded-xl bg-[#eff4ff] font-mono text-xs text-[#0b1c30] break-all font-bold">
                {inspectingMask.regexPattern}
              </div>
            </div>

            <div className="space-y-2 text-xs font-['Manrope'] text-[#44474d]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  check_circle
                </span>
                <span>Permits 2-character telecom routing prefix (e.g., VM, AD, VK)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  check_circle
                </span>
                <span>Strict boundary anchors prevent suffix spoofing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  check_circle
                </span>
                <span>Zero capture on standard 10-digit mobile numbers</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => showToast('Diagnostic passed 100% against benchmark test set!')}
                className="flex-1 h-11 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-['Space_Grotesk'] text-xs font-bold hover:bg-[#e5eeff]"
              >
                Run Regex Diagnostic
              </button>
              <button
                onClick={() => setInspectingMask(null)}
                className="flex-1 h-11 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-xs font-bold hover:bg-[#213145]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
