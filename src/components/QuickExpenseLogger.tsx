import React, { useState, useEffect, useRef } from 'react';
import { Plus, Sparkles, Check, ChevronDown, Zap } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORIES, Category } from '../types';
import { getCategoryInfo } from '../data/categories';
import { classifyExpense } from '../services/api';

const QUICK_SUGGESTIONS = [
  { label: 'Swiggy dinner', amount: 450 },
  { label: 'Uber cab', amount: 180 },
  { label: 'Milk & bread', amount: 65 },
  { label: 'Amazon order', amount: 899 },
  { label: 'Netflix plan', amount: 649 },
  { label: 'Electricity bill', amount: 1200 },
  { label: 'Chai & snacks', amount: 100 },
];

export const QuickExpenseLogger: React.FC = () => {
  const { addExpense } = useExpense();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<Category>('Food');
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  const debounceTimer = useRef<any>(null);

  // Real-time AI classification as user types description
  useEffect(() => {
    if (!description.trim() || isManualCategory) {
      if (!description.trim()) {
        setDetectedCategory('Food');
      }
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsClassifying(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await classifyExpense(description, parseFloat(amount));
        setDetectedCategory(res.category);
      } catch (err) {
        // Fallback handled in service
      } finally {
        setIsClassifying(false);
      }
    }, 250);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [description, amount, isManualCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addExpense({
      description: description.trim(),
      amount: parsedAmount,
      category: detectedCategory,
    });

    setDescription('');
    setAmount('');
    setIsManualCategory(false);
    setRecentlyAdded(true);
    setTimeout(() => setRecentlyAdded(false), 2500);
  };

  const handleSuggestionClick = (item: (typeof QUICK_SUGGESTIONS)[0]) => {
    setDescription(item.label);
    setAmount(item.amount.toString());
    setIsManualCategory(false);
  };

  const categoryMeta = getCategoryInfo(detectedCategory);
  const CategoryIcon = categoryMeta.icon;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Expense Logger
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Zap className="h-3 w-3 text-emerald-600" />
            AI Auto-Categorized
          </span>
        </div>
        {recentlyAdded && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fade-in">
            <Check className="h-3.5 w-3.5" />
            Added in 1-click!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
          {/* Description input */}
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              required
              placeholder="What did you spend on? (e.g. Swiggy dinner, Uber, Milk)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsManualCategory(false);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          {/* Amount input */}
          <div className="sm:col-span-3 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-bold text-lg font-mono">
              ₹
            </div>
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-8 pr-4 py-3.5 text-base font-bold font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          {/* Big Green Add Expense Button */}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={!description.trim() || !amount}
              className="w-full h-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 text-base shadow-sm shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Live Category Indicator & Quick Change */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs border transition-all cursor-pointer ${categoryMeta.badgeClass}`}
              >
                <span>{categoryMeta.emoji}</span>
                <span>{detectedCategory}</span>
                {isClassifying && (
                  <span className="text-[10px] text-slate-400 animate-pulse">(AI thinking...)</span>
                )}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Category Dropdown if user explicitly wants to change */}
              {showCategoryMenu && (
                <div className="absolute left-0 mt-2 z-20 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Change Category
                  </div>
                  {CATEGORIES.map((cat) => {
                    const cInfo = getCategoryInfo(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setDetectedCategory(cat);
                          setIsManualCategory(true);
                          setShowCategoryMenu(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          detectedCategory === cat
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{cInfo.emoji}</span>
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Auto-detected by Gemini AI • No manual clicking required)
            </span>
          </div>

          {/* Quick Click Suggestions */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] text-slate-400">Try:</span>
            {QUICK_SUGGESTIONS.slice(0, 4).map((sugg) => (
              <button
                key={sugg.label}
                type="button"
                onClick={() => handleSuggestionClick(sugg)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
              >
                {sugg.label} ₹{sugg.amount}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
