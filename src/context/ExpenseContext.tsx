import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { Expense, SpendingTip, Category } from '../types';
import { SAMPLE_EXPENSES } from '../data/demoData';
import { fetchAiTip } from '../services/api';

const STORAGE_KEY = 'expenseiq_simple_expenses_v1';

interface ExpenseContextType {
  expenses: Expense[];
  aiTip: SpendingTip | null;
  isTipLoading: boolean;
  addExpense: (expense: { description: string; amount: number; category: Category }) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
  fillSampleExpenses: () => void;
  refreshTip: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    // Default to the 6 sample Indian expenses so first visit is already beautiful!
    return SAMPLE_EXPENSES;
  });

  const [aiTip, setAiTip] = useState<SpendingTip | null>({
    title: 'AI Tip of the Day',
    advice: 'Food accounts for 32% of your expenses. Packing lunch just two days this week can easily save you ₹600!',
  });
  const [isTipLoading, setIsTipLoading] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [expenses]);

  // Load fresh AI tip
  const refreshTip = async () => {
    if (expenses.length === 0) {
      setAiTip({
        title: 'Welcome to ExpenseIQ',
        advice: 'Log your first expense or tap "Fill Sample Expenses" to receive personalized financial advice!',
      });
      return;
    }
    setIsTipLoading(true);
    try {
      const tip = await fetchAiTip(expenses);
      setAiTip(tip);
    } catch (err) {
      console.warn('Could not fetch tip', err);
    } finally {
      setIsTipLoading(false);
    }
  };

  useEffect(() => {
    refreshTip();
  }, [expenses.length]);

  const addExpense = (newExpense: { description: string; amount: number; category: Category }) => {
    const item: Expense = {
      id: 'exp-' + Date.now(),
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category,
      date: 'Today',
      timestamp: Date.now(),
    };
    setExpenses((prev) => [item, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAllExpenses = () => {
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const fillSampleExpenses = () => {
    setExpenses(SAMPLE_EXPENSES);
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch (e) {}
    refreshTip();
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        aiTip,
        isTipLoading,
        addExpense,
        deleteExpense,
        clearAllExpenses,
        fillSampleExpenses,
        refreshTip,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within an ExpenseProvider');
  return ctx;
};
