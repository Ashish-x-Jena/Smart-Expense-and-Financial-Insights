import React from 'react';
import { useFinance, AppTab } from '../context/FinanceContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setQuickAddOpen, unverifiedQueue } = useFinance();

  const unreviewedCount = unverifiedQueue.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff]/95 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-4px_16px_rgba(13,28,50,0.06)] lg:hidden">
      <div className="h-16 relative max-w-md mx-auto flex items-center justify-between px-1">
        {/* Left Symmetric Group (3 Tabs) */}
        <div className="flex-1 flex items-center justify-around pr-6 sm:pr-8">
          {/* Tab 1: Overview */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all ${
              activeTab === 'overview'
                ? 'text-[#0d1c32] font-bold scale-105'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
            aria-label="Overview"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-['Manrope'] text-[9px] tracking-tight mt-0.5">Overview</span>
          </button>

          {/* Tab 2: Ledger */}
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all ${
              activeTab === 'ledger'
                ? 'text-[#0d1c32] font-bold scale-105'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
            aria-label="Ledger"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span className="font-['Manrope'] text-[9px] tracking-tight mt-0.5">Ledger</span>
          </button>

          {/* Tab 3: Budgets */}
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all ${
              activeTab === 'budgets'
                ? 'text-[#0d1c32] font-bold scale-105'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
            aria-label="Budgets"
          >
            <span className="material-symbols-outlined text-[20px]">donut_large</span>
            <span className="font-['Manrope'] text-[9px] tracking-tight mt-0.5">Budgets</span>
          </button>
        </div>

        {/* DEAD CENTER FLOATING ADD BUTTON - Exact 50% Horizontal Centering */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20 flex flex-col items-center">
          <button
            onClick={() => setQuickAddOpen(true)}
            aria-label="Center Add Button"
            className="w-12 h-12 rounded-full bg-[#0d1c32] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(13,28,50,0.32)] ring-4 ring-white hover:bg-[#213145] hover:scale-105 transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[26px] text-[#86f2e4] group-hover:rotate-90 transition-transform duration-200">
              add
            </span>
          </button>
          <span className="font-['Manrope'] text-[9px] font-bold text-[#0d1c32] mt-1 bg-white/80 px-1 rounded">
            Add
          </span>
        </div>

        {/* Right Symmetric Group (3 Tabs) */}
        <div className="flex-1 flex items-center justify-around pl-6 sm:pr-2">
          {/* Tab 4: Insights */}
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all ${
              activeTab === 'insights'
                ? 'text-[#0d1c32] font-bold scale-105'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
            aria-label="Insights"
          >
            <span className="material-symbols-outlined text-[20px]">insights</span>
            <span className="font-['Manrope'] text-[9px] tracking-tight mt-0.5">Insights</span>
          </button>

          {/* Tab 5: Review */}
          <button
            onClick={() => setActiveTab('review')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all relative ${
              activeTab === 'review'
                ? 'text-[#0d1c32] font-bold scale-105'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
            aria-label="Review Queue"
          >
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            <span className="font-['Manrope'] text-[9px] tracking-tight mt-0.5">Review</span>
            {unreviewedCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#ba1a1a] text-white font-['Manrope'] text-[9px] font-bold leading-none ring-2 ring-white">
                {unreviewedCount}
              </span>
            )}
          </button>

          {/* Tab 6: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-all ${
              activeTab === 'settings'
                ? 'text-[#0d1c32] font-bold scale-105'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-['Manrope'] text-[9px] tracking-tight mt-0.5">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
