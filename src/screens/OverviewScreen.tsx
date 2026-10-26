import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const OverviewScreen: React.FC = () => {
  const {
    totalSpent,
    totalInflow,
    netCashFlow,
    savingsRate,
    projectedMonthEnd,
    transactions,
    budgets,
    recurringExpenses,
    notifications,
    setActiveTab,
    setQuickAddOpen,
    setAiAssistantOpen,
  } = useFinance();

  const totalPool = budgets.reduce((sum, b) => sum + b.limit, 0);
  const poolRemaining = Math.max(0, totalPool - totalSpent);
  const poolPercentage = totalPool > 0 ? Math.round((totalSpent / totalPool) * 1000) / 10 : 0;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-24 md:pb-12">
      <div className="flex flex-col gap-6">
        {/* Welcome Greeting & Quick AI Trigger */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-['Manrope'] text-xs font-bold text-[#006a61] uppercase tracking-wider">
              Financial Control Hub
            </span>
            <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#0b1c30]">
              Welcome back, Priyansh
            </h1>
          </div>
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#86f2e4] text-[#005049] font-['Manrope'] text-xs font-bold shadow-sm hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span>Ask FinGuru</span>
          </button>
        </div>

        {/* Hero Budget Pool Card */}
        <section className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white p-5 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-40 h-40 rounded-full bg-[#515f78]/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-['Manrope'] text-xs text-[#76849f] tracking-wider uppercase font-medium">
                  October Budget Pool
                </span>
                <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 tabular-nums">
                  ₹{totalPool.toLocaleString('en-IN')}.00
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#006a61] text-white font-['Manrope'] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">shield</span> Pacing: Safe
                </span>
                <span className="font-['Manrope'] text-xs text-[#76849f] mt-1 font-semibold tabular-nums">
                  {poolPercentage}% consumed
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-['Manrope'] text-xs text-[#76849f] font-medium tabular-nums">
                <span>₹{totalSpent.toLocaleString('en-IN')} spent</span>
                <span>₹{poolRemaining.toLocaleString('en-IN')} remaining</span>
              </div>
              <div className="h-2.5 w-full bg-[#213145] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#89f5e7] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(75, poolPercentage)}%` }}
                ></div>
                <div
                  className="h-full bg-[#ffb95f] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(0, poolPercentage - 75)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1 text-[#b9c7e4]">
                <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">
                  trending_up
                </span>
                <span>Projected Month-End</span>
              </div>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#86f2e4] tabular-nums">
                ₹{projectedMonthEnd.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </section>

        {/* Telemetry Metric Twin Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
              Net Cash Flow
            </span>
            <div className="mt-2">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#006a61] tabular-nums">
                +₹{netCashFlow.toLocaleString('en-IN')}
              </span>
              <span className="block font-['Manrope'] text-[11px] text-[#44474d] mt-0.5">
                Inflow ₹{totalInflow.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
              Savings Rate
            </span>
            <div className="mt-2">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#0d1c32] tabular-nums">
                {savingsRate}%
              </span>
              <span className="block font-['Manrope'] text-[11px] text-[#006a61] font-semibold mt-0.5">
                Target: 40% Met
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Matrix */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#0d1c32] hover:bg-[#213145] text-white rounded-xl font-['Manrope'] text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">add</span>
            <span>Fast Add</span>
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-xl font-['Manrope'] text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006a61]">
              donut_large
            </span>
            <span>Budgets</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-xl font-['Manrope'] text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#b87500]">
              auto_graph
            </span>
            <span>Forecast</span>
          </button>
        </div>

        {/* Critical Alerts Banner (if any) */}
        {notifications.length > 0 && (
          <div className="bg-[#eff4ff] rounded-2xl p-4 border border-[#006a61]/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] mt-0.5">
              warning
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30] block">
                {notifications[0].title}
              </span>
              <p className="font-['Manrope'] text-xs text-[#44474d] mt-0.5 leading-snug">
                {notifications[0].message}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-[#006a61] font-['Manrope'] text-xs font-bold hover:underline shrink-0"
            >
              Resolve
            </button>
          </div>
        )}

        {/* Upcoming Recurring Subscriptions Strip */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                event_repeat
              </span>
              <h2 className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                Upcoming Recurring Expenses
              </h2>
            </div>
            <span className="font-['Manrope'] text-xs text-[#44474d]">
              {recurringExpenses.length} active mandates
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {recurringExpenses.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff] text-xs font-['Manrope']"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#44474d]">
                    smart_display
                  </span>
                  <div>
                    <span className="font-bold text-[#0b1c30] block">{rec.merchant}</span>
                    <span className="text-[#75777e] text-[10px]">Due {rec.nextExpectedDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#ba1a1a] font-['Space_Grotesk'] tabular-nums">
                    ₹{rec.amount}/mo
                  </span>
                  {rec.isIdle && (
                    <span className="block text-[9px] font-bold text-[#b87500]">
                      Idle 45 days
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ledger Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
              Recent Activity
            </h2>
            <button
              onClick={() => setActiveTab('ledger')}
              className="font-['Manrope'] text-xs font-bold text-[#006a61] hover:underline flex items-center gap-0.5"
            >
              <span>View Full Ledger</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setActiveTab('ledger')}
                className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-[#eff4ff] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#e5eeff] text-[#0d1c32] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {tx.type === 'refund' ? 'currency_exchange' : 'receipt'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30] truncate">
                      {tx.merchant}
                    </span>
                    <span className="font-['Manrope'] text-[10px] text-[#44474d]">
                      {tx.category} · {tx.sourceProvider}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-['Space_Grotesk'] text-sm font-bold tabular-nums ${
                    tx.type === 'refund' || tx.type === 'credit'
                      ? 'text-[#006a61]'
                      : 'text-[#ba1a1a]'
                  }`}
                >
                  {tx.type === 'refund' || tx.type === 'credit' ? '+' : '-'}₹
                  {tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
