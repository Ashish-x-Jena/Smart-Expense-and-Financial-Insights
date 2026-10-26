import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const SmsBackgroundExplainerModal: React.FC = () => {
  const {
    smsExplainerOpen,
    setSmsExplainerOpen,
    backgroundSmsListening,
    setBackgroundSmsListening,
    triggerBackgroundSmsSimulation,
    setActiveTab,
  } = useFinance();

  if (!smsExplainerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#213145]/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header Hero Card - Matching Design Reference */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white p-5 shadow-lg border border-slate-700/40">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-[#86f2e4]/15 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                  Explain SMS background status
                </h3>
                <p className="font-['Manrope'] text-xs text-[#76849f] mt-1">
                  On-device parsing engine, browser sandbox limits & native telemetry
                </p>
              </div>

              <button
                onClick={() => setSmsExplainerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Enhancement Badge matching prompt screenshot */}
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 font-['Manrope'] text-xs font-semibold text-[#89f5e7]">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Enhancement</span>
              </span>

              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    backgroundSmsListening ? 'bg-[#89f5e7] animate-pulse' : 'bg-[#ffb95f]'
                  }`}
                ></span>
                <span className="font-['Manrope'] text-xs font-bold text-white">
                  {backgroundSmsListening ? 'Daemon Active' : 'Daemon Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Direct Answer */}
        <div className="bg-[#eff4ff] rounded-2xl p-4 border border-[#cbdbf5]/60 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006a61]">
              help_center
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
              Is the SMS Parser working in the background?
            </span>
          </div>
          <p className="font-['Manrope'] text-xs text-[#44474d] leading-relaxed">
            <strong className="text-[#0b1c30]">Yes, with architectural distinction:</strong> In a web browser environment, security policies restrict direct background access to the phone's private SMS inbox. To provide authentic expense tracking, our on-device simulation daemon actively captures simulated and imported banking texts while the app is active, parsing them in local volatile RAM.
          </p>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="flex flex-col gap-3">
          {/* Pillar 1: Web Sandbox */}
          <div className="rounded-xl p-3.5 bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#006a61] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </div>
            <div className="flex-1">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30] block">
                1. Web Browser Security Sandbox
              </span>
              <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5 leading-relaxed">
                Standard web browsers do not provide an SMS Inbox API for security. Any website claiming to directly read your inbox without a native wrapper is inaccurate.
              </p>
            </div>
          </div>

          {/* Pillar 2: On-Device Regex Engine */}
          <div className="rounded-xl p-3.5 bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#86f2e4]/30 text-[#006a61] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="flex-1">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30] block">
                2. 100% On-Device Neural & DLT Parsing
              </span>
              <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5 leading-relaxed">
                Raw SMS text is normalized entirely in local JavaScript memory. No financial data, account numbers, or balances are transmitted to external cloud servers.
              </p>
            </div>
          </div>

          {/* Pillar 3: Native Android BroadcastReceiver */}
          <div className="rounded-xl p-3.5 bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0d1c32] text-[#86f2e4] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">android</span>
            </div>
            <div className="flex-1">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30] block">
                3. Native Android Distribution (TWA / APK)
              </span>
              <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5 leading-relaxed">
                In production Android distribution, this same parser engine connects to an Android <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">BroadcastReceiver</code> with <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">SMS_RECEIVED</code> permission for true background capture.
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls & Telemetry */}
        <div className="bg-[#f8f9ff] rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30]">
              Background Ingestion Controls
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backgroundSmsListening}
                onChange={(e) => setBackgroundSmsListening(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006a61]"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col">
              <span className="text-[#75777e] font-medium text-[11px]">Scan Interval</span>
              <span className="font-['Space_Grotesk'] font-bold text-[#0b1c30]">Every 45 seconds</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col">
              <span className="text-[#75777e] font-medium text-[11px]">Approved Senders</span>
              <span className="font-['Space_Grotesk'] font-bold text-[#006a61]">12 Telecom Masks</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                triggerBackgroundSmsSimulation();
                setSmsExplainerOpen(false);
              }}
              className="flex-1 h-11 rounded-xl bg-[#006a61] text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#005049] transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                bolt
              </span>
              <span>Simulate Inbound SMS</span>
            </button>

            <button
              onClick={() => {
                setSmsExplainerOpen(false);
                setActiveTab('approved-senders');
              }}
              className="h-11 px-3 rounded-xl bg-white text-[#0b1c30] border border-slate-200 font-['Manrope'] text-xs font-semibold flex items-center justify-center gap-1 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#44474d]">
                verified_user
              </span>
              <span>Manage Masks</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setSmsExplainerOpen(false)}
          className="w-full h-11 bg-[#0d1c32] text-white rounded-xl font-['Space_Grotesk'] text-xs font-semibold flex items-center justify-center hover:bg-[#213145] transition-colors"
        >
          Understood & Done
        </button>
      </div>
    </div>
  );
};
