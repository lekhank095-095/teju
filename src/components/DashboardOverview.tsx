import React from 'react';
import { TrendingUp, Layers, Flame, PieChart as PieIcon } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORIES, Category } from '../types';
import { formatRupees, getCategoryInfo } from '../data/categories';

export const DashboardOverview: React.FC = () => {
  const { expenses } = useExpense();

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const itemCount = expenses.length;

  // Calculate category totals
  const categoryTotals: Record<Category, number> = {
    Food: 0,
    Transport: 0,
    Bills: 0,
    Shopping: 0,
    Entertainment: 0,
    Others: 0,
  };

  expenses.forEach((e) => {
    if (e.category in categoryTotals) {
      categoryTotals[e.category] += Number(e.amount) || 0;
    } else {
      categoryTotals.Others += Number(e.amount) || 0;
    }
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, amount]) => amount > 0);

  const topCategory = sortedCategories[0] || ['Food', 0];
  const topCategoryName = topCategory[0] as Category;
  const topCategoryAmount = topCategory[1];
  const topCategoryPercent = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;
  const topCategoryMeta = getCategoryInfo(topCategoryName);

  return (
    <div className="space-y-4">
      {/* 3 Big Vital Numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Spent */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent This Month</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatRupees(totalSpent)}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Across all everyday expenses
            </p>
          </div>
        </div>

        {/* Card 2: Top Spending Category */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Top Spending Category</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{topCategoryMeta.emoji}</span>
                <span>{topCategoryName}</span>
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-slate-700">
                {formatRupees(topCategoryAmount)}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-slate-600">
                {topCategoryPercent}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Number of Items Tracked */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Items Tracked</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {itemCount}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Transactions saved locally
            </p>
          </div>
        </div>
      </div>

      {/* Spending Breakdown Progress Bar & Category Tags */}
      {totalSpent > 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Spending Breakdown</h3>
            <span className="text-xs text-slate-500 font-medium">Where your money went</span>
          </div>

          {/* Multi-segment stacked visual bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex gap-0.5">
            {sortedCategories.map(([category, amount]) => {
              const info = getCategoryInfo(category);
              const percent = Math.max(3, Math.round((amount / totalSpent) * 100));
              return (
                <div
                  key={category}
                  className={`h-full ${info.pillBg} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${percent}%` }}
                  title={`${category}: ${formatRupees(amount)} (${Math.round((amount / totalSpent) * 100)}%)`}
                />
              );
            })}
          </div>

          {/* Category Pills List */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {sortedCategories.map(([category, amount]) => {
              const info = getCategoryInfo(category);
              const percent = Math.round((amount / totalSpent) * 100);
              return (
                <div
                  key={category}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${info.badgeClass}`}
                >
                  <span>{info.emoji}</span>
                  <span>{category}:</span>
                  <span className="font-mono font-bold">{formatRupees(amount)}</span>
                  <span className="opacity-70 text-[11px]">({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
