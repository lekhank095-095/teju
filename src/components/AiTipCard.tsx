import React from 'react';
import { Bot, RefreshCw, Sparkles, Lightbulb } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const AiTipCard: React.FC = () => {
  const { aiTip, isTipLoading, refreshTip, expenses } = useExpense();

  if (!aiTip && expenses.length === 0) return null;

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 text-lg">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-indigo-950">AI Tip of the Day</h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                Personalized
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-700 leading-relaxed max-w-2xl">
              {aiTip?.advice ||
                'Tracking your expenses daily is the single most effective way to eliminate impulse buys and save consistently.'}
            </p>
          </div>
        </div>

        <button
          onClick={refreshTip}
          disabled={isTipLoading}
          className="shrink-0 rounded-xl p-2 text-indigo-600 hover:bg-indigo-100/60 transition-colors disabled:opacity-40 cursor-pointer"
          title="Refresh AI tip"
        >
          <RefreshCw className={`h-4 w-4 ${isTipLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
