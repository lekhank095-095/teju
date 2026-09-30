import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Initialize Google Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PERMITTED_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Others',
] as const;

type Category = (typeof PERMITTED_CATEGORIES)[number];

// High-speed heuristic rule engine
function classifyWithRules(description: string): {
  category: Category;
  confidence: number;
  reason: string;
} {
  const desc = (description || '').toLowerCase();

  // Food
  if (
    /swiggy|zomato|mcdonald|kfc|starbucks|pizza|burger|dinner|lunch|breakfast|cafe|restaurant|tea|chai|coffee|food|dosa|biryani|subway|dominos|eatclub|milk|bread|groceries|grocery|blinkit|zepto|instamart|snacks|snack|bakery|fruits|veg|paneer|curd/i.test(
      desc
    )
  ) {
    return {
      category: 'Food',
      confidence: 98,
      reason: 'Matched food, restaurant, grocery, or beverage service.',
    };
  }

  // Transport
  if (
    /uber|ola|rapido|metro|petrol|diesel|fuel|parking|toll|fastag|cab|taxi|flight|train|irctc|bus|commute|auto|rickshaw/i.test(
      desc
    )
  ) {
    return {
      category: 'Transport',
      confidence: 96,
      reason: 'Matched rideshare, public transit, fuel, or travel.',
    };
  }

  // Bills
  if (
    /electricity|bescom|water|gas|wifi|broadband|airtel|jio|vi|recharge|maintenance|rent|cylinder|pipe|piped gas|society|tata power|cylinder|bill|recharge/i.test(
      desc
    )
  ) {
    return {
      category: 'Bills',
      confidence: 97,
      reason: 'Matched household utilities, phone, or broadband bills.',
    };
  }

  // Shopping
  if (
    /amazon|flipkart|myntra|zara|h&m|clothing|shoes|electronics|purchase|mall|market|bazaar|order|supermarket|shirt|pant|watch|phone|laptop|cable|shoes|dress/i.test(
      desc
    )
  ) {
    return {
      category: 'Shopping',
      confidence: 95,
      reason: 'Matched retail shopping, clothing, or e-commerce purchases.',
    };
  }

  // Entertainment
  if (
    /netflix|spotify|prime|hotstar|youtube|apple music|pvr|inox|cinema|movie|bookmyshow|game|steam|playstation|concert|club|party|bowling|theatre|event/i.test(
      desc
    )
  ) {
    return {
      category: 'Entertainment',
      confidence: 98,
      reason: 'Matched movies, streaming services, or recreational activities.',
    };
  }

  return {
    category: 'Others',
    confidence: 75,
    reason: 'General everyday expenditure.',
  };
}

// Timeout helper for instant fallback responsiveness
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// 1. Live Auto-Categorize Endpoint
app.post('/api/classify', async (req, res) => {
  const { description, amount } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required' });
  }

  // If no Gemini key or placeholder, instantly use the pattern matcher
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    const fallback = classifyWithRules(description);
    return res.json({
      ...fallback,
      source: 'rule-engine',
    });
  }

  try {
    const prompt = `Classify this personal expense into exactly one of these 6 categories:
- Food
- Transport
- Bills
- Shopping
- Entertainment
- Others

Expense description: "${description}" (Amount: ₹${amount || 'Not provided'})`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'One of: Food, Transport, Bills, Shopping, Entertainment, Others',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Confidence score percentage (70 to 99)',
              },
              reason: {
                type: Type.STRING,
                description: 'One short sentence explaining why',
              },
            },
            required: ['category', 'confidence'],
          },
        },
      }),
      2500
    );

    const parsed = JSON.parse(response.text || '{}');
    let category = parsed.category as Category;

    if (!PERMITTED_CATEGORIES.includes(category)) {
      const match = PERMITTED_CATEGORIES.find((c) =>
        c.toLowerCase().includes(String(category).toLowerCase())
      );
      category = match || 'Others';
    }

    return res.json({
      category,
      confidence: Math.min(99, Math.max(70, parsed.confidence || 95)),
      reason: parsed.reason || 'Auto-categorized by Gemini AI',
      source: 'gemini-ai',
    });
  } catch (err: any) {
    const fallback = classifyWithRules(description);
    return res.json({
      ...fallback,
      source: 'rule-engine',
    });
  }
});

// 2. Plain-English AI Financial Tips Endpoint
app.post('/api/tips', async (req, res) => {
  const { expenses } = req.body;

  const total = Array.isArray(expenses)
    ? expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)
    : 0;

  // Local rule-based tip generator for instant response
  const categoryTotals: Record<string, number> = {};
  if (Array.isArray(expenses)) {
    expenses.forEach((e: any) => {
      const c = e.category || 'Others';
      categoryTotals[c] = (categoryTotals[c] || 0) + (Number(e.amount) || 0);
    });
  }

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0] || ['Food', 0];
  const topPercent = total > 0 ? Math.round((topCat[1] / total) * 100) : 0;

  let fallbackTip = '';
  if (topCat[0] === 'Food' && topPercent > 35) {
    fallbackTip = `You spent ${topPercent}% of your budget on Food. Cooking at home twice this week could save you around ₹800!`;
  } else if (topCat[0] === 'Transport' && topPercent > 25) {
    fallbackTip = `Transport accounts for ${topPercent}% of your spending (₹${topCat[1]}). Consider carpooling or metro passes to trim your daily commute cost!`;
  } else if (topCat[0] === 'Shopping' && topPercent > 30) {
    fallbackTip = `Shopping is currently ${topPercent}% of your expenses. Try a 48-hour cooling-off rule before buying non-essential items!`;
  } else if (topCat[0] === 'Entertainment' && topPercent > 20) {
    fallbackTip = `Entertainment represents ${topPercent}% of your spend. Review unused subscriptions to save ₹500–₹1,000 every month!`;
  } else {
    fallbackTip = `Great job tracking your expenses! Staying consistent is the #1 habit of financially smart people.`;
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return res.json({
      title: 'Smart Saving Tip',
      advice: fallbackTip,
      source: 'rule-engine',
    });
  }

  try {
    const prompt = `Based on these user expenses (Total ₹${total}, Top category: ${topCat[0]} at ${topPercent}%):
Provide ONE super practical, motivating 1-2 sentence tip in warm, friendly, plain English.
Focus on simple everyday habits (like making coffee, batch cooking, checking subscriptions).`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              advice: { type: Type.STRING },
            },
            required: ['advice'],
          },
        },
      }),
      2500
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      title: parsed.title || 'AI Tip of the Day',
      advice: parsed.advice || fallbackTip,
      source: 'gemini-ai',
    });
  } catch (e) {
    return res.json({
      title: 'AI Tip of the Day',
      advice: fallbackTip,
      source: 'rule-engine',
    });
  }
});

// 3. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Vite or static files
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ExpenseIQ listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
