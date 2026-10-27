import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';

export const BudgetsScreen: React.FC = () => {
  const {
    budgets,
    totalSpent,
    projectedMonthEnd,
    createBudget,
    rebalanceBudgets,
    monthlyBudgetPool,
    setMonthlyBudgetPool,
    distributeBudgetPool,
    firebaseSyncStatus,
  } = useFinance();

  const [newBudgetModalOpen, setNewBudgetModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [selectedThreshold, setSelectedThreshold] = useState<number>(85);
  const [globalAlertsEnabled, setGlobalAlertsEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual & Scrollable Monthly Budget Pool State
  const [poolInputVal, setPoolInputVal] = useState<string>(monthlyBudgetPool.toString());
  const [isPoolExpanded, setIsPoolExpanded] = useState<boolean>(true);

  // Keep manual input in sync when context pool changes
  useEffect(() => {
    setPoolInputVal(monthlyBudgetPool.toString());
  }, [monthlyBudgetPool]);

  // Derived budget telemetry
  const totalAllocated = budgets.reduce((sum, b) => sum + b.limit, 0);
  const unallocatedBuffer = monthlyBudgetPool - totalAllocated;
  const poolRemaining = Math.max(0, monthlyBudgetPool - totalSpent);
  const poolPercentage =
    monthlyBudgetPool > 0 ? Math.round((totalSpent / monthlyBudgetPool) * 1000) / 10 : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleManualPoolSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(poolInputVal.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed) || parsed < 1000) {
      showToast('Please enter a valid monthly budget pool (min ₹1,000)');
      return;
    }
    setMonthlyBudgetPool(parsed);
    showToast(`Monthly budget pool updated to ₹${parsed.toLocaleString('en-IN')}`);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMonthlyBudgetPool(val);
    setPoolInputVal(val.toString());
  };

  const handleStepPool = (delta: number) => {
    const nextVal = Math.max(1000, monthlyBudgetPool + delta);
    setMonthlyBudgetPool(nextVal);
    setPoolInputVal(nextVal.toString());
    showToast(`Pool adjusted to ₹${nextVal.toLocaleString('en-IN')}`);
  };

  const handleDistributePool = () => {
    distributeBudgetPool(monthlyBudgetPool);
    showToast(
      `Distributed ₹${monthlyBudgetPool.toLocaleString('en-IN')} proportionally across ${
        budgets.length
      } categories!`
    );
  };

  const handleMatchPoolToSum = () => {
    setMonthlyBudgetPool(totalAllocated);
    setPoolInputVal(totalAllocated.toString());
    showToast(`Monthly pool matched to category sum: ₹${totalAllocated.toLocaleString('en-IN')}`);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newLimit) return;
    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    createBudget(newCategoryName.trim(), limitNum);
    setNewCategoryName('');
    setNewLimit('');
    setNewBudgetModalOpen(false);
    showToast(`Category budget "${newCategoryName}" allocated successfully!`);
  };

  const handleRebalance = () => {
    rebalanceBudgets();
    showToast('Surpluses reallocated to Housing & Transport buffers!');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-24 md:pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 max-w-md mx-auto bg-[#006a61] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold z-50 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Cycle Ribbon Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a61] text-[18px]">
              calendar_clock
            </span>
            <span className="font-['Manrope'] text-xs text-[#44474d] font-bold tracking-wide uppercase">
              October Cycle
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#dce9ff] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] animate-pulse"></span>
            <span className="font-['Manrope'] text-xs text-[#0b1c30] font-bold">5 Days Left</span>
          </div>
        </div>

        {/* Hero Budget Summary Card */}
        <section className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-xs text-[#76849f] tracking-wider uppercase font-medium">
                Monthly Budget Pool
              </span>
              <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 tabular-nums">
                ₹{monthlyBudgetPool.toLocaleString('en-IN')}.00
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                {firebaseSyncStatus === 'synced' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#182a40] border border-[#86f2e4]/40 text-[#86f2e4] font-['Manrope'] text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#86f2e4] animate-pulse"></span>
                    Firebase
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#006a61] text-white font-['Manrope'] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">shield</span> Safety: OK
                </span>
              </div>
              <span className="font-['Manrope'] text-xs text-[#76849f] mt-0.5 font-semibold tabular-nums">
                {poolPercentage}% consumed
              </span>
            </div>
          </div>

          {/* Multi-Segment Visual Dial/Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5 font-['Manrope'] text-xs text-[#76849f] font-medium tabular-nums">
              <span>₹{totalSpent.toLocaleString('en-IN')}.00 spent</span>
              <span>₹{poolRemaining.toLocaleString('en-IN')}.00 left</span>
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

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#89f5e7] text-[16px]">
                  trending_up
                </span>
                <span className="font-['Manrope'] text-xs text-[#76849f]">
                  Projected month-end
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-base font-bold text-[#89f5e7] tabular-nums">
                ₹{projectedMonthEnd.toLocaleString('en-IN')}.00
              </span>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleRebalance}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#213145] text-[#eaf1ff] hover:bg-[#39475f] active:scale-95 transition-all text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Rebalance</span>
            </button>
            <button
              onClick={() => setNewBudgetModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#006a61] text-white hover:bg-[#005049] active:scale-95 transition-all text-xs font-semibold shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>New Category</span>
            </button>
          </div>
        </section>

        {/* Interactive Monthly Budget Pool Controller (Manual & Scrollable) */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#86f2e4]/30 text-[#006f66] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
                    Monthly Budget Pool Controller
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006a61] border border-blue-100">
                    Scroll & Manual
                  </span>
                </div>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  Configure ceiling via numeric input or continuous scroll slider
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsPoolExpanded(!isPoolExpanded)}
              className="p-1.5 text-[#44474d] hover:text-[#0b1c30] rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle budget pool panel"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isPoolExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {isPoolExpanded && (
            <div className="flex flex-col gap-4 pt-1 animate-in fade-in duration-200">
              {/* Part 1: Manual Numeric Input Field */}
              <form
                onSubmit={handleManualPoolSubmit}
                className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-['Space_Grotesk'] text-base font-bold text-[#006a61]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1000"
                    max="500000"
                    step="500"
                    value={poolInputVal}
                    onChange={(e) => setPoolInputVal(e.target.value)}
                    onBlur={() => handleManualPoolSubmit()}
                    placeholder="Enter monthly pool ceiling..."
                    className="w-full h-11 pl-8 pr-4 bg-[#eff4ff] border border-slate-200 rounded-xl font-['Space_Grotesk'] text-base font-bold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006a61] transition-all tabular-nums"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-xs font-semibold hover:bg-[#213145] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#86f2e4]">
                    check_circle
                  </span>
                  <span>Set Pool</span>
                </button>
              </form>

              {/* Quick Stepper Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-['Manrope'] text-[11px] text-[#44474d] font-semibold mr-1">
                  Quick Adjust:
                </span>
                {[-5000, -1000, 1000, 5000, 10000].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleStepPool(delta)}
                    className="px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-['Manrope'] text-xs font-bold transition-all active:scale-95 border border-slate-200/60"
                  >
                    {delta > 0
                      ? `+ ₹${(delta / 1000).toLocaleString()}k`
                      : `- ₹${(Math.abs(delta) / 1000).toLocaleString()}k`}
                  </button>
                ))}
              </div>

              {/* Part 2: Scrollable / Drag Range Slider */}
              <div className="flex flex-col gap-1.5 bg-[#eff4ff]/60 p-3.5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-['Manrope'] text-[11px] text-[#44474d] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                      swipe
                    </span>
                    Scroll / Drag Dial
                  </span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#006a61] tabular-nums">
                    ₹{monthlyBudgetPool.toLocaleString('en-IN')}{' '}
                    <span className="text-[11px] font-normal text-[#44474d]">/ month</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="1000"
                  value={Math.min(200000, Math.max(10000, monthlyBudgetPool))}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#006a61]"
                />

                {/* Slider Scale Ticks */}
                <div className="flex justify-between text-[10px] font-['Manrope'] text-[#76849f] font-semibold px-0.5">
                  <span>₹10K</span>
                  <span>₹50K</span>
                  <span>₹100K</span>
                  <span>₹150K</span>
                  <span>₹200K+</span>
                </div>
              </div>

              {/* Part 3: Allocation Balancing & Buffer Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#44474d]">
                    Target Pool
                  </span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30] mt-0.5 tabular-nums">
                    ₹{monthlyBudgetPool.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#006a61] font-semibold mt-0.5">
                    Monthly ceiling
                  </span>
                </div>

                <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#44474d]">
                    Categories Sum
                  </span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30] mt-0.5 tabular-nums">
                    ₹{totalAllocated.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#44474d] font-semibold mt-0.5">
                    Across {budgets.length} categories
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl flex flex-col ${
                    unallocatedBuffer >= 0
                      ? 'bg-[#86f2e4]/20 border border-[#86f2e4]/40'
                      : 'bg-[#ffdad6] border border-[#ba1a1a]/30'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      unallocatedBuffer >= 0 ? 'text-[#006f66]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    {unallocatedBuffer >= 0 ? 'Safety Buffer' : 'Over-Allocated'}
                  </span>
                  <span
                    className={`font-['Space_Grotesk'] text-base font-bold mt-0.5 tabular-nums ${
                      unallocatedBuffer >= 0 ? 'text-[#006f66]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    ₹{Math.abs(unallocatedBuffer).toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      unallocatedBuffer >= 0 ? 'text-[#006f66]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    {unallocatedBuffer >= 0 ? 'Unassigned cushion' : 'Exceeds target pool'}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Pool Balancing */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDistributePool}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#006a61] text-white hover:bg-[#005049] active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">balance</span>
                  <span>Distribute Pool Across Categories</span>
                </button>
                <button
                  type="button"
                  onClick={handleMatchPoolToSum}
                  className="py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                  <span>Match Pool to Category Sum</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Savings Target Tracker Card */}
        <section className="bg-[#eff4ff] rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#86f2e4] text-[#006f66] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">savings</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                  Emergency Fund
                </span>
                <span className="font-['Manrope'] text-[11px] text-[#44474d]">
                  Liquid Cushion Reserve
                </span>
              </div>
            </div>
            <span className="font-['Manrope'] text-xs text-[#006a61] font-bold">60% Met</span>
          </div>

          <div className="mt-1 flex justify-between items-baseline">
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#0b1c30] tabular-nums">
              ₹15,000
            </span>
            <span className="font-['Manrope'] text-xs text-[#44474d] tabular-nums">
              Goal: ₹25,000
            </span>
          </div>

          <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden mt-0.5">
            <div
              className="bg-[#006a61] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: '60%' }}
            ></div>
          </div>
          <p className="font-['Manrope'] text-[11px] text-[#44474d] mt-0.5">
            ₹2,000 auto-allocated from last week's surplus.
          </p>
        </section>

        {/* Category Budgets Section Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30] tracking-tight">
              Active Allocations
            </h2>
            <span className="font-['Manrope'] text-xs text-[#44474d]">
              {budgets.length} categorized spending tracks
            </span>
          </div>
          <button
            onClick={() => showToast('Budgets ordered by utilization risk')}
            className="flex items-center gap-1 text-[#44474d] font-['Manrope'] text-xs font-semibold bg-[#e5eeff] px-3 py-1 rounded-full hover:text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[14px]">sort</span>
            <span>Risk Priority</span>
          </button>
        </div>

        {/* Category Budgets List */}
        <div className="flex flex-col gap-3">
          {budgets.map((b) => {
            const isCritical = b.percentageConsumed >= 90;
            const isWarning = b.percentageConsumed >= 80 && b.percentageConsumed < 90;

            return (
              <article
                key={b.id}
                className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Manrope'] text-sm sm:text-base font-bold text-[#0b1c30]">
                        {b.categoryName}
                      </span>
                      <span className="font-['Manrope'] text-xs text-[#44474d]">
                        {b.subtext}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-['Manrope'] text-xs font-bold tabular-nums ${
                      isCritical
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : isWarning
                        ? 'bg-[#ffddb8] text-[#2a1700]'
                        : 'bg-[#86f2e4]/30 text-[#006f66]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {isCritical ? 'error' : isWarning ? 'warning' : 'check_circle'}
                    </span>
                    {b.percentageConsumed}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#0b1c30] tabular-nums">
                      ₹{b.spent.toLocaleString('en-IN')}
                    </span>
                    <span className="font-['Manrope'] text-xs text-[#44474d] tabular-nums">
                      / ₹{b.limit.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span
                    className={`font-['Manrope'] text-xs font-bold tabular-nums ${
                      isCritical
                        ? 'text-[#ba1a1a]'
                        : isWarning
                        ? 'text-[#b87500]'
                        : 'text-[#006a61]'
                    }`}
                  >
                    ₹{b.remaining.toLocaleString('en-IN')} remaining
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden mt-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? 'bg-[#ba1a1a]'
                        : isWarning
                        ? 'bg-[#ffb95f]'
                        : 'bg-[#006a61]'
                    }`}
                    style={{ width: `${Math.min(100, b.percentageConsumed)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[#44474d] pt-1 font-['Manrope'] text-[11px]">
                  {isCritical ? (
                    <span className="text-[#ba1a1a] font-semibold flex items-center gap-1">
                      🔴 Critical Threshold (90% Alert active)
                    </span>
                  ) : isWarning ? (
                    <span className="text-[#b87500] font-semibold flex items-center gap-1">
                      ⚠️ Warning Threshold (80% Breached)
                    </span>
                  ) : (
                    <span className="text-[#006a61] font-semibold">
                      Normal pacing (Within limits)
                    </span>
                  )}
                  <span>Auto-tracking: Active</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Budget Threshold Settings Preview Card */}
        <section className="bg-[#eff4ff] rounded-2xl p-5 shadow-sm border border-slate-200/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61] text-[22px]">
                notifications_active
              </span>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
                Threshold Alerts
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalAlertsEnabled}
                onChange={(e) => setGlobalAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006a61]"></div>
            </label>
          </div>
          <p className="font-['Manrope'] text-xs text-[#44474d]">
            Dispatch proactive SMS & in-app nudges when category limits approach critical marks.
          </p>

          {/* Threshold Selector Pill Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { val: 50, label: 'Halfway', color: 'bg-white text-[#0b1c30]' },
              { val: 75, label: 'Pacing', color: 'bg-[#006a61] text-white shadow-sm' },
              { val: 90, label: 'Warning', color: 'bg-[#ffddb8] text-[#2a1700]' },
              { val: 100, label: 'Max Cap', color: 'bg-[#ffdad6] text-[#93000a]' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => {
                  setSelectedThreshold(item.val);
                  showToast(`Threshold updated to ${item.val}%`);
                }}
                className={`flex flex-col items-center py-2.5 px-1 rounded-xl transition-all active:scale-95 ${
                  selectedThreshold === item.val ? 'ring-2 ring-[#006a61]' : ''
                } ${item.color}`}
              >
                <span className="font-['Space_Grotesk'] text-base font-bold leading-none">
                  {item.val}%
                </span>
                <span className="font-['Manrope'] text-[10px] mt-1 font-semibold">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white p-3 rounded-xl flex items-center justify-between text-[#0b1c30]">
            <span className="font-['Manrope'] text-xs font-semibold">
              Current trigger behavior:
            </span>
            <span className="font-['Manrope'] text-xs text-[#006a61] font-bold uppercase">
              {globalAlertsEnabled ? 'SMS & Push Enabled' : 'Alerts Paused'}
            </span>
          </div>
        </section>

        {/* Create New Category Budget Button */}
        <div className="pt-1">
          <button
            onClick={() => setNewBudgetModalOpen(true)}
            className="w-full h-12 bg-[#0d1c32] text-white rounded-xl flex items-center justify-center gap-2 font-['Space_Grotesk'] text-sm font-semibold active:scale-[0.98] transition-all shadow-md hover:bg-[#213145]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Create New Category Budget</span>
          </button>
        </div>
      </div>

      {/* Slide-Up Drawer Modal for New Budget */}
      {newBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-6 flex flex-col gap-4 shadow-2xl max-w-lg mx-auto w-full animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#86f2e4] text-[#006f66] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">category</span>
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30]">
                  New Category Budget
                </h3>
              </div>
              <button
                onClick={() => setNewBudgetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#44474d] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Healthcare & Wellness"
                  className="h-12 px-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-['Manrope'] text-sm focus:outline-none focus:ring-2 focus:ring-[#006a61]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Monthly Allocation Pool (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="₹5,000"
                  className="h-12 px-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-['Manrope'] text-sm focus:outline-none focus:ring-2 focus:ring-[#006a61]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs text-[#44474d] font-semibold">
                  Alert Threshold
                </label>
                <div className="flex items-center justify-between bg-[#eff4ff] px-4 py-3 rounded-xl">
                  <span className="font-['Manrope'] text-xs text-[#0b1c30]">
                    Notify me at 85% utilization
                  </span>
                  <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                    check_circle
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="h-12 bg-[#006a61] text-white rounded-xl font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>Confirm & Allocate</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
