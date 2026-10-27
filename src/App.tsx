import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LedgerScreen } from './screens/LedgerScreen';
import { OverviewScreen } from './screens/OverviewScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ApprovedSendersScreen } from './screens/ApprovedSendersScreen';
import { QuickAddModal } from './components/QuickAddModal';
import { CsvModal } from './components/CsvModal';
import { FinancialAssistantModal } from './components/FinancialAssistantModal';
import { SmsBackgroundExplainerModal } from './components/SmsBackgroundExplainerModal';
import { LoginScreen } from './screens/LoginScreen';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isAuthenticated } = useFinance();
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Protected Route Check: Unauthenticated users are served the Login & Sign-Up flow
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* Top Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full pt-18 sm:pt-20">
        {activeTab === 'overview' && <OverviewScreen />}
        {activeTab === 'ledger' && (
          <LedgerScreen onOpenCsvModal={() => setCsvModalOpen(true)} />
        )}
        {activeTab === 'budgets' && <BudgetsScreen />}
        {activeTab === 'insights' && <InsightsScreen />}
        {activeTab === 'review' && <ReviewScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen
            onOpenApprovedSenders={() => setActiveTab('approved-senders')}
            onOpenCsvModal={() => setCsvModalOpen(true)}
          />
        )}
        {activeTab === 'approved-senders' && <ApprovedSendersScreen />}
      </main>

      {/* Fixed Bottom Tab Navigation (Mobile) */}
      <BottomNav />

      {/* Global Interactive Modals */}
      <QuickAddModal />
      <CsvModal isOpen={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
      <FinancialAssistantModal />
      <SmsBackgroundExplainerModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
