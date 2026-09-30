export const CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Others',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  confidence?: number;
  date: string; // e.g. "Today", "Yesterday", or "30 Sep"
  timestamp: number;
}

export interface ClassificationResult {
  category: Category;
  confidence: number;
  reason?: string;
  source?: string;
}

export interface SpendingTip {
  title: string;
  advice: string;
  icon?: string;
}
