/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import { Header } from './components/Header';
import { QuickExpenseLogger } from './components/QuickExpenseLogger';
import { DashboardOverview } from './components/DashboardOverview';
import { AiTipCard } from './components/AiTipCard';
import { ExpenseHistoryList } from './components/ExpenseHistoryList';
import { ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 1. One-Click Quick Expense Logger (Prominent Top Focus) */}
        <QuickExpenseLogger />

        {/* 2. Simple Dashboard Overview (Big Clear Numbers & Breakdown) */}
        <DashboardOverview />

        {/* 3. Plain-English AI Financial Tips */}
        <AiTipCard />

        {/* 4. Easy Expense History Table with Trash Icon */}
        <ExpenseHistoryList />

        {/* Clean Footer */}
        <footer className="pt-4 pb-8 text-center text-xs text-slate-600 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>ExpenseIQ • Auto-categorized with Gemini AI • Data saved locally in your browser</span>
        </footer>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <MainApp />
    </ExpenseProvider>
  );
}
