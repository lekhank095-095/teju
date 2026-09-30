import {
  UtensilsCrossed,
  Car,
  ReceiptText,
  ShoppingBag,
  Film,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { Category } from '../types';

export interface CategoryInfo {
  name: Category;
  icon: LucideIcon;
  badgeClass: string;
  pillBg: string;
  pillText: string;
  borderClass: string;
  dotColor: string;
  hex: string;
  emoji: string;
}

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  Food: {
    name: 'Food',
    icon: UtensilsCrossed,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pillBg: 'bg-emerald-500',
    pillText: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    dotColor: '#10b981',
    hex: '#10b981',
    emoji: '🍔',
  },
  Transport: {
    name: 'Transport',
    icon: Car,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    pillBg: 'bg-blue-500',
    pillText: 'text-blue-700',
    borderClass: 'border-blue-200',
    dotColor: '#3b82f6',
    hex: '#3b82f6',
    emoji: '🚗',
  },
  Bills: {
    name: 'Bills',
    icon: ReceiptText,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    pillBg: 'bg-amber-500',
    pillText: 'text-amber-700',
    borderClass: 'border-amber-200',
    dotColor: '#f59e0b',
    hex: '#f59e0b',
    emoji: '⚡',
  },
  Shopping: {
    name: 'Shopping',
    icon: ShoppingBag,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    pillBg: 'bg-purple-500',
    pillText: 'text-purple-700',
    borderClass: 'border-purple-200',
    dotColor: '#8b5cf6',
    hex: '#8b5cf6',
    emoji: '🛍️',
  },
  Entertainment: {
    name: 'Entertainment',
    icon: Film,
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    pillBg: 'bg-pink-500',
    pillText: 'text-pink-700',
    borderClass: 'border-pink-200',
    dotColor: '#ec4899',
    hex: '#ec4899',
    emoji: '🎬',
  },
  Others: {
    name: 'Others',
    icon: HelpCircle,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    pillBg: 'bg-slate-500',
    pillText: 'text-slate-700',
    borderClass: 'border-slate-200',
    dotColor: '#64748b',
    hex: '#64748b',
    emoji: '📦',
  },
};

export function getCategoryInfo(category: string): CategoryInfo {
  if (category in CATEGORY_INFO) {
    return CATEGORY_INFO[category as Category];
  }
  // Mapping helpers for standard variations
  if (/food|dining|snack|chai|coffee|dinner|lunch|breakfast|tea/i.test(category)) return CATEGORY_INFO.Food;
  if (/transport|uber|ola|cab|auto|commute|travel|flight|train/i.test(category)) return CATEGORY_INFO.Transport;
  if (/bill|utilit|power|electric|recharge|water|gas|wifi/i.test(category)) return CATEGORY_INFO.Bills;
  if (/shop|cloth|amazon|flipkart|zara|myntra|buy/i.test(category)) return CATEGORY_INFO.Shopping;
  if (/entertain|movie|netflix|cinema|pvr|music|spotify/i.test(category)) return CATEGORY_INFO.Entertainment;
  return CATEGORY_INFO.Others;
}

export function formatRupees(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}
