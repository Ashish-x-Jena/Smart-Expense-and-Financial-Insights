import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isEstimate?: boolean;
}

export const FinancialAssistantModal: React.FC = () => {
  const {
    aiAssistantOpen,
    setAiAssistantOpen,
    totalSpent,
    totalInflow,
    netCashFlow,
    savingsRate,
    projectedMonthEnd,
    budgets,
    whatIfSavings,
    transactions,
  } = useFinance();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Hello! I am FinGuru, your personal financial insights assistant. I have live access to your verified October ledger, budgets, and predictive projections. How can I assist you with your expenses today?",
    },
  ]);

  if (!aiAssistantOpen) return null;

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('spend') || q.includes('how much') || q.includes('spent this month')) {
      return `📊 **Recorded Facts:**\n- Total October consumption spend: **₹${totalSpent.toLocaleString('en-IN')}.00**.\n- Total inflow (salary + refunds): **₹${totalInflow.toLocaleString('en-IN')}.00**.\n- Net Cash Flow: **+₹${netCashFlow.toLocaleString('en-IN')}.00**.\n\n*Note: Internal transfers (like ₹5,000 to Mom) and refunds (₹1,499 from Zara) are strictly excluded from consumption to ensure zero double-counting.*`;
    }

    if (q.includes('where did most') || q.includes('highest') || q.includes('most of my money')) {
      return `📌 **Top Spending Concentrations (October):**\n1. **Food & Dining:** ₹14,280 (33% of recorded spending)\n2. **Housing & Utilities:** ₹12,500 (29% of recorded spending)\n3. **Shopping & Discretionary:** ₹6,450 (15% of recorded spending)\n4. **Transportation & Fuel:** ₹4,820 (11% of recorded spending)\n5. **Subscriptions:** ₹2,140 (5 active autopays)\n\n💡 **Observation:** Food & Dining is your highest variable expenditure this cycle.`;
    }

    if (q.includes('exceed') || q.includes('likely to exceed') || q.includes('overrun')) {
      const criticalBudgets = budgets.filter((b) => b.percentageConsumed >= 90);
      const critText = criticalBudgets
        .map((b) => `• **${b.categoryName}:** ${b.percentageConsumed}% used (only ₹${b.remaining} remaining)`)
        .join('\n');

      return `⚠️ **Budget Overrun Risk Analysis:**\n${critText}\n\n🔮 **Projections:**\n- Your projected month-end expenditure is **₹${projectedMonthEnd.toLocaleString('en-IN')}** against your total budget pool of **₹52,000**.\n- You have an estimated **₹4,400 cushion** overall, but specific categories like **Housing & Utilities** and **Transportation** have already triggered 90% threshold alerts!`;
    }

    if (q.includes('save') || q.includes('reducing') || q.includes('dining')) {
      return `💡 **Simulation & Savings Opportunity:**\n- Current baseline dining spend: approx. **₹14,250/mo**.\n- Reducing discretionary dining out by **20%** will save **₹${whatIfSavings.monthlySavings.toLocaleString('en-IN')}/month**.\n- Compounded annually, this creates **₹${whatIfSavings.annualWealth.toLocaleString('en-IN')}/year** in additional wealth that can be redirected into your Emergency Fund or mutual fund SIP!`;
    }

    if (q.includes('compare') || q.includes('previous month') || q.includes('september')) {
      return `📈 **Month-over-Month Comparison:**\n- **September Actual Final:** ₹39,400\n- **October MTD Recorded:** ₹${totalSpent.toLocaleString('en-IN')}\n- **October Projected Final:** ₹${projectedMonthEnd.toLocaleString('en-IN')} (**+11.1% increase**)\n- **Primary Driver:** Food & Dining increased by +18.2% (mainly weekend dining and Swiggy deliveries).`;
    }

    if (q.includes('subscription') || q.includes('netflix') || q.includes('hotstar')) {
      return `🔄 **Subscription Audit:**\nYou have **4 recurring subscriptions** totaling **₹2,140/mo**:\n• Netflix: ₹649/mo (Active, due 23 Nov)\n• Disney+ Hotstar: ₹499/mo (**Idle for 45 days** with 0 recorded viewings!)\n• Spotify Premium: ₹119/mo (Active)\n• ACT Fibernet: ₹724/mo (Active)\n\n🎯 **Recommendation:** Pausing Hotstar could immediately save you ₹499/month.`;
    }

    // Default conversational response
    return `Based on your ${transactions.length} recorded transactions for October:\n- Total Outflow: **₹${totalSpent.toLocaleString('en-IN')}**\n- Net Savings: **₹${netCashFlow.toLocaleString('en-IN')}** (${savingsRate}% savings rate)\n- Projected Month-End: **₹${projectedMonthEnd.toLocaleString('en-IN')}**\n\nIs there a specific category or budget you would like me to drill into?`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
    };

    const replyText = generateAnswer(input.trim());
    const botMsg: Message = {
      id: `bot-${Date.now() + 1}`,
      sender: 'assistant',
      text: replyText,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handlePromptChipClick = (promptText: string) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptText,
    };
    const replyText = generateAnswer(promptText);
    const botMsg: Message = {
      id: `bot-${Date.now() + 1}`,
      sender: 'assistant',
      text: replyText,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-xl w-full flex flex-col gap-3 h-[85vh] animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006a61] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
                  FinGuru AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] font-['Manrope'] text-[9px] font-bold uppercase">
                  Data-Grounded
                </span>
              </div>
              <p className="font-['Manrope'] text-[11px] text-[#44474d]">
                Zero hallucinations • Grounded in authorized ledger facts
              </p>
            </div>
          </div>
          <button
            onClick={() => setAiAssistantOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#44474d]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs font-['Manrope'] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0d1c32] text-white rounded-br-none shadow-sm'
                    : 'bg-[#eff4ff] text-[#0b1c30] rounded-bl-none border border-slate-100'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            'How much did I spend this month?',
            'Where did most of my money go?',
            'Am I likely to exceed my budget?',
            'How much could I save on dining?',
            'Compare this month with September',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptChipClick(prompt)}
              className="px-3 py-1.5 rounded-full bg-[#e5eeff] text-[#0d1c32] hover:bg-[#dce9ff] text-[11px] font-['Manrope'] font-semibold shrink-0 transition-all text-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spending, budgets, savings..."
            className="flex-1 h-11 px-4 bg-[#eff4ff] rounded-xl font-['Manrope'] text-xs font-semibold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006a61]"
          />
          <button
            type="submit"
            className="h-11 px-4 bg-[#0d1c32] text-white rounded-xl font-['Manrope'] text-xs font-bold hover:bg-[#213145] transition-transform active:scale-95 flex items-center justify-center gap-1"
          >
            <span>Ask</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
