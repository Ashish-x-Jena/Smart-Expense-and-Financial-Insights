import React, { useState } from 'react';
import { useFinance, AppTab } from '../context/FinanceContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationCount,
    setAiAssistantOpen,
    userPreferences,
    notifications,
    markNotificationRead,
    setQuickAddOpen,
  } = useFinance();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const getSubheaderTitle = (tab: AppTab): string => {
    switch (tab) {
      case 'overview':
        return 'Dashboard';
      case 'ledger':
        return 'Transactions';
      case 'budgets':
        return 'Budgets';
      case 'insights':
        return 'Insights';
      case 'review':
        return 'Review Queue';
      case 'settings':
      case 'approved-senders':
        return 'Settings';
      default:
        return 'Financial Insights';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            aria-label="Smart Expense Home"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0d1c32] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px] text-[#86f2e4]">
                account_balance_wallet
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-[18px] font-bold text-[#0b1c30] tracking-tight leading-none">
                Smart Expense
              </span>
              <span className="font-['Manrope'] text-[11px] text-[#44474d] font-semibold tracking-normal mt-0.5">
                {getSubheaderTitle(activeTab)}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#e5eeff]/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#0d1c32] text-white shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#0d1c32] text-white shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'budgets'
                ? 'bg-[#0d1c32] text-white shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            Budgets
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'insights'
                ? 'bg-[#0d1c32] text-white shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            Insights & Forecast
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-[#0d1c32] text-white shadow-sm'
                : 'text-[#44474d] hover:text-[#0b1c30]'
            }`}
          >
            Review Queue
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fast Add Button (Desktop) */}
          <button
            onClick={() => setQuickAddOpen(true)}
            aria-label="Add Expense"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d1c32] hover:bg-[#213145] text-white transition-all font-['Space_Grotesk'] text-xs font-semibold shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">add</span>
            <span>Add Expense</span>
          </button>

          {/* AI Financial Assistant trigger */}
          <button
            onClick={() => setAiAssistantOpen(true)}
            aria-label="Open AI Financial Assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#86f2e4]/30 hover:bg-[#86f2e4]/50 text-[#006a61] transition-colors font-['Manrope'] text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span className="hidden sm:inline">FinGuru AI</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              aria-label="Notifications"
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#44474d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ba1a1a] text-white font-['Manrope'] text-[10px] font-bold leading-none ring-2 ring-[#f8f9ff]">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-['Space_Grotesk'] font-bold text-sm text-[#0b1c30]">
                      Notifications
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006a61]">
                      {unreadNotificationCount} Unread
                    </span>
                  </div>
                  <button
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs text-[#75777e] hover:text-[#0b1c30]"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                        n.read ? 'bg-slate-50 opacity-70' : 'bg-[#eff4ff]/80 hover:bg-[#eff4ff]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30]">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#75777e]">{n.timestamp}</span>
                      </div>
                      <p className="font-['Manrope'] text-[11px] text-[#44474d] mt-1 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar -> Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            aria-label="Profile and Settings"
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-full hover:bg-[#eff4ff] transition-colors"
          >
            <img
              src={userPreferences.avatarUrl}
              alt={userPreferences.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
