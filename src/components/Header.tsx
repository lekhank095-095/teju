import React from 'react';
import { Sparkles, Wallet, Zap } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const Header: React.FC = () => {
  const { fillSampleExpenses } = useExpense();

  return (
    <header className="border-b border-slate-200/80 bg-white/90 sticky top-0 z-30 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-500/30">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Expense<span className="text-emerald-600">IQ</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <Zap className="h-3 w-3" />
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Smart & Easy Expense Tracker</p>
          </div>
        </div>

        {/* Demo Action Button for Judges */}
        <div className="flex items-center gap-2">
          <button
            onClick={fillSampleExpenses}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Populate 6 everyday Indian expenses for instant demonstration"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>✨ Fill Sample Expenses (Demo)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
