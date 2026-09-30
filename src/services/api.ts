import { Category, ClassificationResult, SpendingTip, Expense } from '../types';

export function localClassify(description: string): ClassificationResult {
  const desc = (description || '').toLowerCase();

  if (/swiggy|zomato|mcdonald|kfc|starbucks|pizza|burger|dinner|lunch|breakfast|cafe|restaurant|tea|chai|coffee|food|dosa|biryani|subway|dominos|eatclub|milk|bread|groceries|grocery|blinkit|zepto|instamart|snacks|snack|bakery|fruits|veg|paneer|curd/i.test(desc)) {
    return { category: 'Food', confidence: 98, reason: 'Food, groceries, or dining' };
  }
  if (/uber|ola|rapido|metro|petrol|diesel|fuel|parking|toll|fastag|cab|taxi|flight|train|irctc|bus|commute|auto|rickshaw/i.test(desc)) {
    return { category: 'Transport', confidence: 96, reason: 'Commute, cab, or travel' };
  }
  if (/electricity|bescom|water|gas|wifi|broadband|airtel|jio|vi|recharge|maintenance|rent|cylinder|pipe|piped gas|society|tata power|cylinder|bill|recharge/i.test(desc)) {
    return { category: 'Bills', confidence: 97, reason: 'Utilities or phone recharge' };
  }
  if (/amazon|flipkart|myntra|zara|h&m|clothing|shoes|electronics|purchase|mall|market|bazaar|order|supermarket|shirt|pant|watch|phone|laptop|cable|shoes|dress/i.test(desc)) {
    return { category: 'Shopping', confidence: 95, reason: 'Shopping and retail items' };
  }
  if (/netflix|spotify|prime|hotstar|youtube|apple music|pvr|inox|cinema|movie|bookmyshow|game|steam|playstation|concert|club|party|bowling|theatre|event/i.test(desc)) {
    return { category: 'Entertainment', confidence: 98, reason: 'Movies, streaming, or outings' };
  }

  return { category: 'Others', confidence: 75, reason: 'General expense' };
}

export async function classifyExpense(description: string, amount?: number): Promise<ClassificationResult> {
  if (!description.trim()) {
    return { category: 'Others', confidence: 70 };
  }

  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, amount }),
    });

    if (!res.ok) throw new Error('API response failed');
    return await res.json();
  } catch (err) {
    return localClassify(description);
  }
}

export async function fetchAiTip(expenses: Expense[]): Promise<SpendingTip> {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0] || ['Food', 0];
  const topPercent = total > 0 ? Math.round((topCat[1] / total) * 100) : 0;

  let defaultAdvice = `You spent ${topPercent}% on ${topCat[0]}. Cooking at home twice this week could save you around ₹800!`;
  if (topCat[0] === 'Transport') {
    defaultAdvice = `Transport accounts for ${topPercent}% of your spend. Metro or carpooling can save ₹1,000+ this month!`;
  } else if (topCat[0] === 'Shopping') {
    defaultAdvice = `Shopping is ${topPercent}% of your expenses. Sleeping on purchases over ₹500 saves an average of ₹2,000/month.`;
  } else if (topCat[0] === 'Entertainment') {
    defaultAdvice = `Entertainment is ${topPercent}% of your budget. Review your active subscriptions to eliminate unused memberships!`;
  }

  try {
    const res = await fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenses }),
    });

    if (!res.ok) throw new Error('Failed to get tips');
    return await res.json();
  } catch (e) {
    return {
      title: 'Smart Saving Tip',
      advice: defaultAdvice,
    };
  }
}
