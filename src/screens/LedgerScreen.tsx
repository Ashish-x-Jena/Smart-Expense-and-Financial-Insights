import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types/finance';

interface LedgerScreenProps {
  onOpenCsvModal: () => void;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({ onOpenCsvModal }) => {
  const {
    transactions,
    totalSpent,
    totalInflow,
    deleteTransaction,
    setEditingTransaction,
    setQuickAddOpen,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        (tx.notes && tx.notes.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'all' || tx.category === selectedCategory;

      const matchesSrc =
        selectedSource === 'all' ||
        tx.sourceProvider.toLowerCase().includes(selectedSource.toLowerCase());

      return matchesSearch && matchesCat && matchesSrc;
    });
  }, [transactions, searchQuery, selectedCategory, selectedSource]);

  // Group transactions by date heading
  const groupedTransactions = useMemo(() => {
    const groups: { label: string; dateStr: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    filteredTransactions.slice(0, visibleCount).forEach((tx) => {
      const d = new Date(tx.date);
      const isToday =
        d.getDate() === 26 && d.getMonth() === 9 && d.getFullYear() === 2024;
      const isYesterday =
        d.getDate() === 25 && d.getMonth() === 9 && d.getFullYear() === 2024;

      let key = tx.date.split('T')[0];
      let label = key;
      if (isToday) label = 'Today, 26 Oct';
      else if (isYesterday) label = 'Yesterday, 25 Oct';
      else if (d.getDate() === 23 && d.getMonth() === 9) label = '23 Oct 2024';
      else if (d.getDate() === 22 && d.getMonth() === 9) label = '22 Oct 2024';
      else if (d.getDate() === 20 && d.getMonth() === 9) label = '20 Oct 2024';
      else if (d.getDate() === 18 && d.getMonth() === 9) label = '18 Oct 2024';
      else if (d.getDate() === 15 && d.getMonth() === 9) label = '15 Oct 2024';
      else if (d.getDate() === 10 && d.getMonth() === 9) label = '10 Oct 2024';
      else if (d.getDate() === 5 && d.getMonth() === 9) label = '05 Oct 2024';
      else if (d.getDate() === 1 && d.getMonth() === 9) label = '01 Oct 2024';
      else {
        label = d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }

      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(tx);
    });

    map.forEach((items, label) => {
      groups.push({ label, dateStr: items[0]?.date || '', items });
    });

    return groups;
  }, [filteredTransactions, visibleCount]);

  const handleExportPDF = () => {
    // Generate browser print / export
    window.print();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food & Dining':
        return 'local_cafe';
      case 'Transportation & Fuel':
        return 'directions_subway';
      case 'Healthcare':
        return 'medication';
      case 'Shopping & Discretionary':
        return 'shopping_bag';
      case 'Subscriptions':
        return 'smart_display';
      case 'Transfers & Remittance':
        return 'family_restroom';
      case 'Refunds':
        return 'currency_exchange';
      case 'Housing & Utilities':
        return 'home';
      case 'Groceries & Essentials':
        return 'local_grocery_store';
      case 'Income':
        return 'payments';
      default:
        return 'receipt';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-24 md:pb-12">
      {/* Search & Filter Toolbar */}
      <div className="pt-2 pb-3 flex flex-col gap-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#44474d] text-[20px]">
            search
          </span>
          <input
            id="transactionSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, note, amount..."
            className="w-full h-12 pl-11 pr-11 bg-[#eff4ff] rounded-xl font-['Manrope'] text-sm text-[#0b1c30] placeholder:text-[#44474d]/70 focus:outline-none focus:bg-[#e5eeff] focus:ring-2 focus:ring-[#006a61]/30 transition-all shadow-sm"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-[#44474d] hover:text-[#0b1c30]"
              aria-label="Clear Search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <button
              aria-label="Voice or Smart Parse"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#44474d] hover:text-[#0b1c30] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
          )}
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSource('all');
              setSearchQuery('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dce9ff] text-[#0b1c30] font-['Manrope'] text-xs font-semibold shrink-0 shadow-sm hover:bg-[#d3e4fe] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>All Records</span>
            <span className="w-4 h-4 rounded-full bg-[#0d1c32] text-white text-[9px] flex items-center justify-center font-bold">
              {transactions.length}
            </span>
          </button>

          {/* Category Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none flex items-center gap-1.5 pl-3 pr-7 py-1.5 rounded-full bg-white text-[#0b1c30] font-['Manrope'] text-xs font-semibold shadow-sm border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transportation & Fuel">Transportation & Fuel</option>
              <option value="Housing & Utilities">Housing & Utilities</option>
              <option value="Shopping & Discretionary">Shopping & Discretionary</option>
              <option value="Groceries & Essentials">Groceries & Essentials</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Refunds">Refunds</option>
              <option value="Transfers & Remittance">Transfers</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[14px] text-[#44474d] pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>

          {/* Source Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="appearance-none flex items-center gap-1.5 pl-3 pr-7 py-1.5 rounded-full bg-white text-[#0b1c30] font-['Manrope'] text-xs font-semibold shadow-sm border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Sources (SMS, UPI...)</option>
              <option value="Google Pay">Google Pay</option>
              <option value="PhonePe">PhonePe UPI</option>
              <option value="Paytm">Paytm</option>
              <option value="Slice">Slice Card</option>
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="SBI">SBI Bank</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[14px] text-[#44474d] pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      {/* Summary Banner & Ledger Telemetry */}
      <div className="py-1">
        <div className="bg-[#0d1c32] text-white rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-[#515f78]/20 pointer-events-none blur-2xl"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-pulse"></span>
                <span className="font-['Space_Grotesk'] text-xs text-[#76849f] tracking-wider uppercase font-semibold">
                  Ledger Telemetry
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-['Manrope'] text-[11px] text-[#d6e3ff] font-semibold">
                {filteredTransactions.length} of {transactions.length} Records
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col bg-white/5 p-3 rounded-xl">
                <span className="font-['Manrope'] text-xs text-[#76849f] font-medium">
                  Total Spent (Debit)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-['Space_Grotesk'] text-xl sm:text-2xl text-[#ffdad6] font-bold tabular-nums">
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#ffdad6]/80">.00</span>
                </div>
              </div>
              <div className="flex flex-col bg-white/5 p-3 rounded-xl">
                <span className="font-['Manrope'] text-xs text-[#76849f] font-medium">
                  Total Inflow (Credit)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-['Space_Grotesk'] text-xl sm:text-2xl text-[#89f5e7] font-bold tabular-nums">
                    ₹{totalInflow.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#89f5e7]/80">.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Action Row */}
      <div className="py-2.5">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onOpenCsvModal}
            className="flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 bg-[#eff4ff] hover:bg-[#e5eeff] rounded-xl text-[#0b1c30] font-['Manrope'] text-[11px] sm:text-xs font-semibold transition-all shadow-sm active:scale-95 text-nowrap"
          >
            <span className="material-symbols-outlined text-[17px] text-[#006a61]">
              file_upload
            </span>
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 bg-[#eff4ff] hover:bg-[#e5eeff] rounded-xl text-[#0b1c30] font-['Manrope'] text-[11px] sm:text-xs font-semibold transition-all shadow-sm active:scale-95 text-nowrap"
          >
            <span className="material-symbols-outlined text-[17px] text-[#44474d]">
              download
            </span>
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 bg-[#0d1c32] hover:bg-[#213145] text-white rounded-xl font-['Manrope'] text-[11px] sm:text-xs font-semibold transition-all shadow-sm active:scale-95 text-nowrap"
          >
            <span className="material-symbols-outlined text-[17px] text-[#86f2e4]">
              add
            </span>
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Grouped Transactions List */}
      <div className="flex flex-col gap-6 pt-1">
        {groupedTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-[#75777e] mb-2">
              search_off
            </span>
            <p className="font-['Space_Grotesk'] font-bold text-lg text-[#0b1c30]">
              No transactions match your search
            </p>
            <p className="font-['Manrope'] text-sm text-[#44474d] mt-1">
              Try adjusting your query or resetting the filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSource('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0d1c32] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedTransactions.map((group) => {
            const groupSpent = group.items
              .filter((tx) => tx.type === 'debit' && !tx.excludedFromConsumption)
              .reduce((sum, tx) => sum + tx.amount, 0);

            return (
              <div key={group.label} className="flex flex-col gap-2.5">
                {/* Group Date Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                    <span className="font-['Manrope'] text-xs text-[#0b1c30] font-bold tracking-wider uppercase">
                      {group.label}
                    </span>
                  </div>
                  <span className="font-['Manrope'] text-[11px] text-[#44474d] font-semibold tabular-nums">
                    {group.items.length} items {groupSpent > 0 ? `· ₹${groupSpent.toLocaleString('en-IN')}` : ''}
                  </span>
                </div>

                {/* Group Transaction Cards */}
                {group.items.map((tx) => {
                  const isPositive = tx.type === 'credit' || tx.type === 'refund';
                  const isExcluded = tx.excludedFromConsumption;

                  return (
                    <div
                      key={tx.id}
                      className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2.5 hover:bg-[#f8f9ff] transition-colors relative overflow-hidden ${
                        tx.type === 'refund' ? 'border-l-4 border-l-[#006a61]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                              tx.type === 'refund'
                                ? 'bg-[#86f2e4] text-[#006f66]'
                                : isPositive
                                ? 'bg-[#89f5e7]/30 text-[#006a61]'
                                : 'bg-[#e5eeff] text-[#0d1c32]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {getCategoryIcon(tx.category)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-['Manrope'] text-sm sm:text-base font-bold text-[#0b1c30] truncate">
                              {tx.merchant}
                            </span>
                            <span className="font-['Manrope'] text-xs text-[#44474d]">
                              {tx.category} · {tx.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span
                            className={`font-['Space_Grotesk'] text-base sm:text-lg font-bold tabular-nums ${
                              tx.type === 'refund'
                                ? 'text-[#006a61]'
                                : isPositive
                                ? 'text-[#006a61]'
                                : 'text-[#ba1a1a]'
                            }`}
                          >
                            {isPositive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}.00
                          </span>
                          {tx.balanceAfter !== undefined && (
                            <span className="font-['Manrope'] text-[10px] text-[#44474d]">
                              Bal: ₹{tx.balanceAfter.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metadata Tags Ribbon */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Payment Source */}
                          <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] font-['Manrope'] text-[10px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-[#006a61]">
                              account_balance_wallet
                            </span>
                            {tx.sourceProvider}
                          </span>

                          {/* Confidence / Detection Tag */}
                          {tx.sourceType === 'sms' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#86f2e4]/30 text-[#005049] font-['Manrope'] text-[10px] flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[12px]">bolt</span>
                              SMS Parsed {tx.parsingConfidence}%
                            </span>
                          )}

                          {tx.sourceType === 'manual' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] font-['Manrope'] text-[10px] flex items-center gap-1 font-medium">
                              <span className="material-symbols-outlined text-[12px]">edit_note</span>
                              Manual Entry
                            </span>
                          )}

                          {tx.type === 'refund' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#006a61] text-white font-['Manrope'] text-[10px] flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[12px]">replay</span>
                              Refund Reversal
                            </span>
                          )}

                          {isExcluded && tx.type !== 'refund' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#44474d] font-['Manrope'] text-[10px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                              Excluded from consumption
                            </span>
                          )}

                          {tx.status === 'flagged' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-['Manrope'] text-[10px] flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[12px]">warning</span>
                              Anomaly Review
                            </span>
                          )}
                        </div>

                        {/* Action Menu Trigger */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === tx.id ? null : tx.id)
                            }
                            aria-label={`Options for ${tx.merchant}`}
                            className="text-[#44474d] hover:text-[#0b1c30] p-1 rounded-lg hover:bg-slate-100"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>

                          {activeMenuId === tx.id && (
                            <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in">
                              <button
                                onClick={() => {
                                  setEditingTransaction(tx);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left font-['Manrope'] text-xs text-[#0b1c30] hover:bg-slate-50 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit Details
                              </button>
                              <button
                                onClick={() => {
                                  deleteTransaction(tx.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left font-['Manrope'] text-xs text-[#ba1a1a] hover:bg-red-50 flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete Entry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}

        {/* Tip Box */}
        <div className="bg-[#eff4ff] rounded-2xl p-3.5 flex items-center justify-between text-[#44474d] shadow-inner border border-slate-200/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#006a61]">
              lightbulb
            </span>
            <span className="font-['Manrope'] text-xs font-medium">
              Tip: Transfers and refunds are automatically excluded from monthly consumption burn to prevent double-counting.
            </span>
          </div>
        </div>

        {/* Pagination Trigger */}
        {visibleCount < filteredTransactions.length && (
          <div className="flex flex-col items-center justify-center pt-2 pb-4 gap-2">
            <div className="px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 flex items-center gap-2">
              <span className="font-['Manrope'] text-xs text-[#44474d] font-semibold tabular-nums">
                Showing 1-{Math.min(visibleCount, filteredTransactions.length)} of{' '}
                {filteredTransactions.length} records
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></div>
            </div>
            <button
              onClick={() => setVisibleCount((prev) => prev + 25)}
              className="px-5 py-2.5 rounded-xl bg-[#0d1c32] text-white font-['Manrope'] text-xs font-semibold flex items-center gap-2 shadow-md hover:bg-[#213145] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
              <span>Load More Transactions</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
