import Groq from "groq-sdk";
import { calculateDashboard } from "./dashboardService.js";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const SYSTEM_PROMPT =
  "You are FinSight AI, a smart financial assistant. Give short, clear, actionable answers.";

let groqClient = null;

const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim();
  if (!key) return null;
  if (!groqClient || groqClient.apiKey !== key) {
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
};

const keywordCategories = {
  Sales: ["sale", "client payment", "invoice", "revenue"],
  Inventory: ["raw material", "stock", "supplier", "purchase", "inventory"],
  Payroll: ["salary", "wages", "employee", "staff"],
  "Rent & Utilities": ["rent", "electricity", "water", "internet", "bill"],
  Marketing: ["ads", "marketing", "facebook ads", "google ads", "promotion"],
  Software: ["subscription", "software", "saas", "license"],
  Logistics: ["transport", "delivery", "shipping", "courier"],
  Misc: [],
};

const fallbackResponse = (query) => {
  const q = String(query || "").toLowerCase();
  if (q.includes("cash")) return "Your cash flow is decreasing due to higher expenses.";
  if (q.includes("profit")) return "Your profit margin is low. Try reducing costs.";
  if (q.includes("expense")) return "High spending detected in key areas.";
  return "Optimize expenses and improve financial planning.";
};

const healthScore = (transactions) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + Number(b.amount || 0), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  if (income === 0) return 0;
  const profitMargin = (income - expense) / income;
  let score = 50;
  if (profitMargin > 0.3) score += 30;
  else if (profitMargin > 0.1) score += 15;
  else score -= 20;
  score += expense < income ? 20 : -20;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const predict = (transactions) => {
  let balance = 0;
  const history = [];
  transactions.forEach((t) => {
    const amount = Number(t.amount || 0);
    balance += t.type === "income" ? amount : -amount;
    history.push(balance);
  });

  if (history.length < 2) {
    return { trend: "stable", future_balance: balance };
  }

  const n = history.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = history.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * history[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 1e-6);

  const avgChange = (history[n - 1] - history[0]) / n;
  const future1 = balance + avgChange;
  const future2 = balance + avgChange * 2;
  const future3 = balance + avgChange * 3;

  return {
    trend: slope > 0 ? "increasing" : "decreasing",
    future_balance: Number(future1.toFixed(2)),
    forecast: {
      month1: Number(future1.toFixed(2)),
      month2: Number(future2.toFixed(2)),
      month3: Number(future3.toFixed(2)),
    },
  };
};

const alerts = (transactions) => {
  const expenses = transactions.filter((t) => t.type === "expense");
  if (expenses.length < 5) return [];

  const amounts = expenses.map((t) => Number(t.amount || 0));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const std = Math.sqrt(variance);

  return expenses
    .filter((t) => Number(t.amount || 0) > mean + 2 * std)
    .map(
      (t) =>
        `Unusual high expense in ${t.category || "Misc"}: INR ${Number(
          t.amount || 0
        ).toFixed(0)}`
    );
};

const ruleInsights = (transactions, summary) => {
  const insights = [];
  if (!transactions.length) return insights;

  const income = summary.revenue || 0;
  const expense = summary.expenses || 0;
  if (income > 0) {
    const profitMargin = (income - expense) / income;
    if (profitMargin < 0.2) {
      insights.push({
        type: "danger",
        emoji: "🔴",
        title: "Low profit margin",
        desc: `Profit margin is ${(profitMargin * 100).toFixed(
          1
        )}%. Net profit is INR ${Math.round(
          income - expense
        )}. Reduce recurring costs to recover.`,
      });
    } else {
      insights.push({
        type: "info",
        emoji: "📈",
        title: "Healthy profit margin",
        desc: `Profit margin is ${(profitMargin * 100).toFixed(
          1
        )}%. Net profit is INR ${Math.round(
          income - expense
        )}. Keep expenses controlled.`,
      });
    }
  }

  const categories = summary.expenseBreakdown || [];
  if (expense > 0 && categories.length) {
    const [top] = categories;
    if (top && top.value > 0.3 * expense) {
      insights.push({
        type: "warning",
        emoji: "💡",
        title: `Top expense: ${top.name}`,
        desc: `${top.name} is ${Math.round(
          (top.value / expense) * 100
        )}% of expenses (INR ${Math.round(
          top.value
        )}). Review vendors and renegotiate terms.`,
      });
    }
  }

  insights.push({
    type: "info",
    emoji: "✅",
    title: "Cash flow check",
    desc: `Avg expense per transaction is INR ${Math.round(
      expense / Math.max(1, transactions.length)
    )}. Track large vendors and enforce approval thresholds.`,
  });

  return insights.slice(0, 3);
};

const buildContext = (transactions) => {
  const summary = calculateDashboard(transactions);
  const pred = predict(transactions);
  const health = healthScore(transactions);
  const alertList = alerts(transactions);
  const insightList = ruleInsights(transactions, summary);

  const totalIncome = summary.revenue || 0;
  const totalExpense = summary.expenses || 0;

  return {
    summary,
    pred,
    health,
    alertList,
    insightList,
    totalIncome,
    totalExpense,
  };
};

const safeGroqChat = async (messages) => {
  const groq = getGroqClient();
  if (!groq) {
    console.warn("Groq disabled: GROQ_API_KEY is missing.");
    return null;
  }
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.2,
  });
  return response?.choices?.[0]?.message?.content?.trim() || null;
};

const parseJsonArray = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch (innerErr) {
        return null;
      }
    }
    return null;
  }
};

export const generateChatResponse = async (query, transactions) => {
  const { pred, health, summary, alertList, insightList, totalIncome, totalExpense } =
    buildContext(transactions);

  const context = `
Total Income: INR ${totalIncome}
Total Expense: INR ${totalExpense}
Health Score: ${health}/100

Trend: ${pred.trend}
Future Balance: INR ${pred.future_balance}

Forecast: ${JSON.stringify(pred.forecast || {})}
Category Breakdown: ${JSON.stringify(summary.expenseBreakdown || [])}
Alerts: ${JSON.stringify(alertList)}
Insights: ${JSON.stringify(insightList)}
`;

  try {
    const output = await safeGroqChat([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Business Data:\n${context}\n\nQuestion: ${query}`,
      },
    ]);
    return output || fallbackResponse(query);
  } catch (err) {
    console.error("Groq chat error:", err?.message || err);
    return fallbackResponse(query);
  }
};

export const generateInsights = async (transactions) => {
  const { summary, pred, health, alertList } = buildContext(transactions);
  const fallback = ruleInsights(transactions, summary);

  const prompt = `
You will be given business summary data. Return exactly 3 insights as JSON.
Each item must include: type (info|warning|danger), emoji, title, desc.
Make desc detailed and specific (include numbers or percentages, and 1 action).
Keep titles under 6 words and desc under 160 characters.
Business Summary: ${JSON.stringify({
    revenue: summary.revenue,
    expenses: summary.expenses,
    profit: summary.profit,
    expenseBreakdown: summary.expenseBreakdown,
    monthlyTrends: summary.monthlyTrends,
    trend: pred.trend,
    health,
    alerts: alertList,
  })}
`;

  try {
    const output = await safeGroqChat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]);
    if (!output) return fallback;
    const parsed = parseJsonArray(output);
    if (Array.isArray(parsed) && parsed.length) return parsed.slice(0, 3);
    return fallback;
  } catch (err) {
    console.error("Groq insights error:", err?.message || err);
    return fallback;
  }
};

export const categorizeDescription = async (description) => {
  const text = String(description || "").toLowerCase();
  for (const [category, keywords] of Object.entries(keywordCategories)) {
    for (const word of keywords) {
      if (text.includes(word)) return category;
    }
  }

  const allowed = Object.keys(keywordCategories);
  const prompt = `
Pick the best category for this transaction description.
Return ONLY one of these exact categories:
${allowed.join(", ")}
Description: ${description || ""}
`;
  try {
    const output = await safeGroqChat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]);
    if (!output) return "Misc";
    const cleaned = output.replace(/[^a-zA-Z &]/g, "").trim();
    return allowed.includes(cleaned) ? cleaned : "Misc";
  } catch (err) {
    console.error("Groq categorize error:", err?.message || err);
    return "Misc";
  }
};
