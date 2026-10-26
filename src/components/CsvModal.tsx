import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types/finance';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvModal: React.FC<CsvModalProps> = ({ isOpen, onClose }) => {
  const { transactions, addTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadSyntheticSample = () => {
    const syntheticRows = [
      {
        date: '2024-10-26T16:00:00',
        merchant: 'Blue Tokai Coffee Roasters',
        category: 'Food & Dining',
        amount: 280,
        type: 'debit',
        source: 'Google Pay',
      },
      {
        date: '2024-10-25T19:30:00',
        merchant: 'Decathlon Sports India',
        category: 'Shopping & Discretionary',
        amount: 1450,
        type: 'debit',
        source: 'Slice Card',
      },
      {
        date: '2024-10-24T12:10:00',
        merchant: 'Swiggy Instamart',
        category: 'Groceries & Essentials',
        amount: 520,
        type: 'debit',
        source: 'PhonePe UPI',
      },
      {
        date: '2024-10-23T18:45:00',
        merchant: 'Shell Petrol Station',
        category: 'Transportation & Fuel',
        amount: 1100,
        type: 'debit',
        source: 'HDFC Debit Card',
      },
      {
        date: '2024-10-22T14:15:00',
        merchant: 'Cult.fit Gym Subscription',
        category: 'Subscriptions',
        amount: 1200,
        type: 'debit',
        source: 'ICICI Bank Autopay',
      },
    ];

    setPreviewData(syntheticRows);
    setImportStatus('Loaded 5 synthetic statement transactions for preview.');
  };

  const handleConfirmImport = () => {
    previewData.forEach((row) => {
      addTransaction({
        amount: row.amount,
        currency: 'INR',
        type: row.type,
        merchant: row.merchant,
        category: row.category,
        date: row.date,
        time: '12:00 PM',
        sourceType: 'csv',
        sourceProvider: row.source,
        excludedFromConsumption: false,
      });
    });

    setPreviewData([]);
    setImportStatus(`Successfully reconciled and imported ${previewData.length} records!`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleDownloadCsv = () => {
    const headers = [
      'ID',
      'Date',
      'Time',
      'Merchant',
      'Category',
      'Amount',
      'Currency',
      'Type',
      'Source',
      'ExcludedFromConsumption',
    ];
    const rows = transactions.map((t) => [
      t.id,
      t.date.split('T')[0],
      t.time,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount,
      t.currency,
      t.type,
      `"${t.sourceProvider}"`,
      t.excludedFromConsumption,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_expense_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smart_expense_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full flex flex-col gap-4 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006a61]">
              swap_horizontal_circle
            </span>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#0b1c30]">
              Data Ingestion & Ledger Export
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#44474d]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-[#eff4ff] rounded-xl text-xs font-['Manrope'] font-bold">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'import' ? 'bg-[#0d1c32] text-white shadow-sm' : 'text-[#44474d]'
            }`}
          >
            Import Statement / CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'export' ? 'bg-[#0d1c32] text-white shadow-sm' : 'text-[#44474d]'
            }`}
          >
            Export Ledger
          </button>
        </div>

        {activeTab === 'import' ? (
          <div className="flex flex-col gap-4">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 bg-[#f8f9ff]">
              <span className="material-symbols-outlined text-3xl text-[#006a61]">
                cloud_upload
              </span>
              <p className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30]">
                Upload CSV or Bank Statement
              </p>
              <p className="font-['Manrope'] text-xs text-[#44474d]">
                Supports PhonePe, Google Pay, HDFC, SBI, Slice formats.
              </p>
              <button
                onClick={handleLoadSyntheticSample}
                className="mt-2 px-4 py-2 rounded-xl bg-[#e5eeff] text-[#0d1c32] font-['Manrope'] text-xs font-bold hover:bg-[#dce9ff] transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">file_copy</span>
                <span>Load 5 Synthetic Test Records</span>
              </button>
            </div>

            {importStatus && (
              <div className="p-3 bg-[#86f2e4]/30 rounded-xl text-xs font-['Manrope'] font-bold text-[#005049] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>{importStatus}</span>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-['Manrope'] text-xs font-bold text-[#0b1c30]">
                  Parsed Preview ({previewData.length} records)
                </span>
                <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs font-['Manrope']">
                    <thead className="bg-[#eff4ff] text-[#44474d]">
                      <tr>
                        <th className="p-2">Merchant</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold text-[#0b1c30]">{row.merchant}</td>
                          <td className="p-2 text-[#44474d]">{row.category}</td>
                          <td className="p-2 text-right font-bold tabular-nums text-[#ba1a1a]">
                            -₹{row.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleConfirmImport}
                  className="w-full py-3 bg-[#006a61] text-white rounded-xl font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform mt-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirm & Reconcile to Ledger</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="p-4 rounded-2xl bg-[#eff4ff] flex items-center justify-between">
              <div>
                <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0b1c30] block">
                  Export Full Ledger
                </span>
                <span className="font-['Manrope'] text-xs text-[#44474d]">
                  {transactions.length} verified records with category & payment channel metadata
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadCsv}
                className="py-3 px-4 rounded-xl bg-[#0d1c32] text-white font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#213145]"
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>Download CSV</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="py-3 px-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-[#e5eeff]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">key</span>
                <span>JSON Backup</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
