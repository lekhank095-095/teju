import React, { useState } from 'react';
import { Trash2, Receipt, Search, Sparkles } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatRupees, getCategoryInfo } from '../data/categories';

export const ExpenseHistoryList: React.FC = () => {
  const { expenses, deleteExpense, clearAllExpenses, fillSampleExpenses } = useExpense();
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Expenses</h3>
          <p className="text-xs text-slate-500">
            {expenses.length} item{expenses.length !== 1 ? 's' : ''} tracked • Saved in your browser
          </p>
        </div>

        {/* Search bar */}
        {expenses.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    clearAllExpenses();
                    setConfirmClear(false);
                  }}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-2.5 py-1 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-xl bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors px-1 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Receipt className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No expenses found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {expenses.length === 0
              ? 'Start by entering an expense above or tap "Fill Sample Expenses".'
              : 'No items match your search.'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={fillSampleExpenses}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>✨ Fill Sample Expenses (Demo)</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredExpenses.map((expense) => {
            const meta = getCategoryInfo(expense.category);
            return (
              <div
                key={expense.id}
                className="group flex items-center justify-between py-3.5 px-2 -mx-2 rounded-2xl hover:bg-slate-50/80 transition-colors"
              >
                {/* Left side: Category Badge & Description */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className={`inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-2xl border ${meta.badgeClass}`}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}>
                        {expense.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {expense.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and Trash button */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {formatRupees(expense.amount)}
                  </span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete this expense"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
