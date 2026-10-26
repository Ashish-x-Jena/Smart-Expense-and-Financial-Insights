import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export const InsightsScreen: React.FC = () => {
  const {
    activeTimeframe,
    setActiveTimeframe,
    projectedMonthEnd,
    dailyRunRate,
    diningCutPercentage,
    setDiningCutPercentage,
    whatIfSavings,
    paymentSourceBreakdown,
    categoryBreakdown,
    totalSpent,
    setActiveTab,
  } = useFinance();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-24 md:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#0d1c32] text-white px-5 py-2.5 rounded-full font-['Manrope'] text-xs font-bold shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">
            download_done
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Top Header Area & Horizon Selector */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-['Manrope'] text-xs uppercase tracking-wider text-[#006a61] font-bold">
                Predictive Intelligence
              </span>
              <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#0b1c30]">
                Financial Analytics & Projections
              </h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#86f2e4]/30 flex items-center justify-center text-[#006a61]">
              <span className="material-symbols-outlined text-[20px]">auto_graph</span>
            </div>
          </div>

          {/* Timeframe Segmented Control */}
          <div className="flex items-center p-1 bg-[#e5eeff] rounded-full max-w-xs">
            {(['Weekly', 'Monthly', 'Quarterly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`flex-1 py-1.5 px-3 rounded-full font-['Manrope'] text-xs font-semibold transition-all text-center ${
                  activeTimeframe === tf
                    ? 'bg-[#0d1c32] text-white shadow-sm'
                    : 'text-[#44474d] hover:text-[#0b1c30]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* AI Analytical Digest */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                psychology
              </span>
              <span className="font-['Manrope'] text-xs text-[#0b1c30] uppercase tracking-wider font-bold">
                AI Analytical Digest
              </span>
            </div>
            <span className="font-['Manrope'] text-[11px] text-[#44474d]">3 alerts pending</span>
          </div>

          {/* Insight 1: Key Trend */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffddb8] text-[#2a1700] font-['Manrope'] text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Key Trend
              </span>
              <span className="font-['Manrope'] text-[11px] text-[#44474d]">Updated 3h ago</span>
            </div>
            <div className="flex items-start gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#ffddb8]/50 flex items-center justify-center shrink-0 text-[#b87500]">
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
              </div>
              <p className="font-['Manrope'] text-sm text-[#0b1c30] leading-snug">
                Food & Dining spending increased by{' '}
                <strong className="text-[#ba1a1a] font-bold">+18.2%</strong> compared to last month (mainly Swiggy & weekend dinners).
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1 pt-2 bg-[#eff4ff] px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                tips_and_updates
              </span>
              <span className="font-['Manrope'] text-xs text-[#44474d] font-medium">
                Suggested dining budget ceiling: ₹11,500
              </span>
            </div>
          </div>

          {/* Insight 2: Recurring Idle */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] font-['Manrope'] text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[14px]">sync</span> Recurring Idle
              </span>
              <span className="font-['Manrope'] text-[11px] text-[#006a61] font-bold">Actionable</span>
            </div>
            <div className="flex items-start gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#86f2e4]/40 flex items-center justify-center shrink-0 text-[#006a61]">
                <span className="material-symbols-outlined text-[18px]">search_check</span>
              </div>
              <p className="font-['Manrope'] text-sm text-[#0b1c30] leading-snug">
                <strong>4 active subscriptions</strong> totaling{' '}
                <span className="font-bold text-[#0b1c30]">₹2,140/mo</span> found. You haven't recorded transactions from <em>Hotstar</em> in 45 days.
              </p>
            </div>
            <div className="flex items-center justify-between mt-1 pt-1">
              <span className="font-['Manrope'] text-xs text-[#44474d]">
                Potential saving: ₹499/mo
              </span>
              <button
                onClick={() => setActiveTab('budgets')}
                className="font-['Manrope'] text-xs font-bold text-[#006a61] flex items-center gap-0.5 hover:underline"
              >
                Manage Subs{' '}
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Insight 3: Unusual Activity */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-['Manrope'] text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[14px]">warning</span> Unusual Activity
              </span>
              <span className="font-['Manrope'] text-[11px] text-[#ba1a1a] font-semibold">Flagged</span>
            </div>
            <div className="flex items-start gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#ffdad6]/60 flex items-center justify-center shrink-0 text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[18px]">priority_high</span>
              </div>
              <p className="font-['Manrope'] text-sm text-[#0b1c30] leading-snug">
                Potential anomaly detected: <strong className="text-[#0b1c30]">₹3,200</strong> electronic accessory charge at <strong>Croma</strong> was{' '}
                <span className="text-[#ba1a1a] font-semibold">2.4x higher</span> than your average shopping transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Breakdown Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30]">
              Visual Breakdown
            </h2>
            <span className="font-['Manrope'] text-xs text-[#44474d] font-medium">October Cycle</span>
          </div>

          {/* Doughnut Category Distribution Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30] block">
                  Category Allocation
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Top expense concentrations
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#e5eeff] font-['Manrope'] text-xs text-[#0b1c30] font-semibold">
                5 Verticals
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* SVG Donut Simulation */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#e5eeff" strokeWidth="12"></circle>
                  {/* Food 33% = 78.85 / 238.76 total circumference */}
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#006a61" strokeDasharray="78.8 238.8" strokeDashoffset="0" strokeWidth="12"></circle>
                  {/* Housing 29% = 69.24 */}
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#0d1c32" strokeDasharray="69.2 238.8" strokeDashoffset="-78.8" strokeWidth="12"></circle>
                  {/* Shopping 15% = 35.81 */}
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#ffb95f" strokeDasharray="35.8 238.8" strokeDashoffset="-148" strokeWidth="12"></circle>
                  {/* Transit 11% = 26.26 */}
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#76849f" strokeDasharray="26.3 238.8" strokeDashoffset="-183.8" strokeWidth="12"></circle>
                  {/* Subscriptions 12% = 28.65 */}
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#ba1a1a" strokeDasharray="28.6 238.8" strokeDashoffset="-210.1" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-['Manrope'] text-[10px] text-[#44474d] font-bold uppercase">
                    Total
                  </span>
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30] leading-none tabular-nums">
                    ₹{(totalSpent / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="w-full sm:flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-['Manrope']">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                    <span className="text-[#0b1c30]">Food & Dining</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">33%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-['Manrope']">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0d1c32]"></span>
                    <span className="text-[#0b1c30]">Housing & Utilities</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">29%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-['Manrope']">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb95f]"></span>
                    <span className="text-[#0b1c30]">Shopping</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">15%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-['Manrope']">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#76849f]"></span>
                    <span className="text-[#0b1c30]">Transit / Fuel</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">11%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-['Manrope']">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                    <span className="text-[#0b1c30]">Subscriptions</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Bar Analytics Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-['Manrope'] text-sm font-bold text-[#0b1c30]">
                  Monthly Trajectory Comparison
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d] block">
                  September Actuals vs. October Projection
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-['Manrope'] text-xs font-bold">
                +11.1%
              </span>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              {/* Sep Actual */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline text-xs font-['Manrope']">
                  <span className="text-[#44474d]">Sep (Actual Final)</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30] tabular-nums">
                    ₹39,400
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div className="h-full bg-[#006a61] rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Oct Actual So Far */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline text-xs font-['Manrope']">
                  <span className="text-[#44474d]">Oct (MTD Recorded)</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30] tabular-nums">
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div className="h-full bg-[#0d1c32] rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* Oct Projected Month End */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline text-xs font-['Manrope']">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#0b1c30] font-semibold">Oct (Projected Final)</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-[#ffb95f]"></span>
                  </div>
                  <span className="font-['Space_Grotesk'] text-sm text-[#b87500] font-bold tabular-nums">
                    ₹{projectedMonthEnd.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#e5eeff] relative overflow-hidden flex">
                  <div className="h-full bg-[#0d1c32] rounded-l-full" style={{ width: '85%' }}></div>
                  <div className="h-full bg-[#ffb95f] opacity-80 rounded-r-full" style={{ width: '10%' }}></div>
                </div>
                <span className="font-['Manrope'] text-[11px] text-[#44474d] text-right">
                  Estimated run rate: ₹{dailyRunRate.toLocaleString('en-IN')}/day remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Month-End Forecasting & "What-If" Savings Simulator */}
        <div className="bg-[#0d1c32] text-white rounded-2xl p-5 shadow-lg flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#006a61]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="font-['Manrope'] text-[11px] uppercase tracking-wider text-[#6bd8cb] font-bold">
                Predictive Model
              </span>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white">
                Month-End Forecasting
              </h3>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white font-['Manrope'] text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#89f5e7]">
                model_training
              </span>
              <span>Simulation</span>
            </div>
          </div>

          {/* Baseline Metric Highlight */}
          <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-xs text-[#76849f]">
                Baseline Projected Spend
              </span>
              <span className="font-['Space_Grotesk'] text-2xl font-bold text-white tabular-nums">
                ₹{projectedMonthEnd.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="font-['Manrope'] text-xs text-[#6bd8cb] font-semibold">
                Forecast Horizon
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-white block">
                31 Oct 2024
              </span>
            </div>
          </div>

          {/* Interactive Range Slider "What-If" Module */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <label
                htmlFor="discretionary-range"
                className="font-['Manrope'] text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <span>Adjust Discretionary Dining</span>
              </label>
              <span
                id="slider-percentage-badge"
                className="px-2.5 py-0.5 rounded-full bg-[#006a61] text-white font-['Manrope'] text-xs font-bold"
              >
                -{diningCutPercentage}%
              </span>
            </div>

            <input
              id="discretionary-range"
              type="range"
              min="0"
              max="50"
              step="5"
              value={diningCutPercentage}
              onChange={(e) => setDiningCutPercentage(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#006a61] focus:outline-none"
            />
            <div className="flex justify-between font-['Manrope'] text-[10px] text-[#76849f] px-0.5">
              <span>0% (As-is)</span>
              <span>-25%</span>
              <span>-50% (Strict)</span>
            </div>
          </div>

          {/* Dynamic Impact Calculation Box */}
          <div className="bg-white text-[#0b1c30] rounded-xl p-4 shadow-sm relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#89f5e7] flex items-center justify-center text-[#00201d] shrink-0">
                <span className="material-symbols-outlined text-[16px]">savings</span>
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                Projected Impact
              </span>
            </div>
            <p className="font-['Manrope'] text-sm text-[#44474d] leading-snug">
              Cut discretionary dining out by{' '}
              <strong className="text-[#006a61] font-bold">{diningCutPercentage}%</strong> → Saves{' '}
              <strong className="text-[#0b1c30] font-bold tabular-nums">
                ₹{whatIfSavings.monthlySavings.toLocaleString('en-IN')}/mo
              </strong>.
            </p>

            <div className="mt-1 pt-2 bg-[#eff4ff] p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-['Manrope'] text-[10px] text-[#44474d] uppercase font-bold">
                  Compounded Annual Wealth
                </span>
                <span className="font-['Space_Grotesk'] text-lg text-[#006a61] font-bold tabular-nums">
                  ₹{whatIfSavings.annualWealth.toLocaleString('en-IN')}/yr
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#86f2e4] text-[#006f66] font-['Manrope'] text-xs font-bold">
                + SIP Target
              </span>
            </div>
          </div>
        </div>

        {/* Payment Source Velocity Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
                Payment Source Comparison
              </h3>
              <span className="font-['Manrope'] text-xs text-[#44474d]">
                Channels routing your expenditures
              </span>
            </div>
            <span className="material-symbols-outlined text-[#006a61] text-[22px]">
              account_balance_wallet
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {paymentSourceBreakdown.map((source) => (
              <div key={source.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-['Manrope']">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                      style={{ backgroundColor: source.color, color: '#fff' }}
                    >
                      {source.icon}
                    </div>
                    <span className="text-[#0b1c30] font-semibold">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#44474d] tabular-nums">
                      ₹{source.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold text-[#0b1c30] tabular-nums">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Action & Regulatory Disclaimer */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex gap-3">
            <button
              onClick={() => showToast('Exporting PDF Report...')}
              className="flex-1 h-12 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-[#213145]"
            >
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => showToast('Generating Excel Sheet...')}
              className="flex-1 h-12 rounded-xl bg-[#dce9ff] text-[#0b1c30] font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-[#cbdbf5]"
            >
              <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                table_chart
              </span>
              <span>Excel Sheet</span>
            </button>
          </div>

          <div className="text-center px-2">
            <p className="font-['Manrope'] text-xs text-[#44474d] opacity-80 leading-relaxed">
              Calculations based on verified user transaction records. Non-binding projections. Predictive heuristics are updated automatically upon SMS reconciliation and synced ledger logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
