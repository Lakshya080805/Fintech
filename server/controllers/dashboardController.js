import Transaction from "../models/Transaction.js";
import { calculateDashboard } from "../services/dashboardService.js";
import { generateInsights } from "../services/aiAssistant.js";

const computeHealth = (summary) => {
  const revenue = summary.revenue || 0;
  const expenses = summary.expenses || 0;
  const profit = summary.profit || 0;

  const profitMargin = revenue > 0 ? profit / revenue : 0;
  const expenseRatio = revenue > 0 ? expenses / revenue : 1;

  const monthly = summary.monthlyTrends || [];
  const last = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const revenueGrowth =
    last && prev && prev.income > 0
      ? (last.income - prev.income) / prev.income
      : 0;

  const liquidityRaw = expenses > 0 ? (revenue - expenses) / expenses : 0;
  const liquidityRatio = Math.max(0, Math.min(3, liquidityRaw));

  let score = 50;
  if (profitMargin > 0.3) score += 30;
  else if (profitMargin > 0.1) score += 15;
  else score -= 20;
  score += expenses < revenue ? 20 : -20;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Needs Attention";
  let message = "Costs are high relative to revenue. Focus on trimming expenses.";
  if (score >= 80) {
    label = "Great Standing";
    message = "Your business is financially strong. Keep scaling efficiently.";
  } else if (score >= 60) {
    label = "Good Standing";
    message = "Your business is financially healthy. Tighten costs to push higher.";
  } else if (score >= 40) {
    label = "Fair Standing";
    message = "Cash position is stable, but margins need improvement.";
  }

  return {
    score,
    label,
    message,
    profitMargin,
    expenseRatio,
    liquidityRatio,
    revenueGrowth,
  };
};

export const getDashboard = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id }).sort({
    date: -1,
  });

  const buildDemoTransactions = () => {
    const now = new Date();
    const makeDate = (monthsAgo, day = 5) =>
      new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 12, 0, 0)
        .toISOString();

    return [
      {
        description: "Platform Subscription",
        amount: 210000,
        type: "income",
        category: "SaaS Revenue",
        date: makeDate(5, 6),
      },
      {
        description: "Cloud Infrastructure",
        amount: 98000,
        type: "expense",
        category: "Infrastructure",
        date: makeDate(5, 16),
      },
      {
        description: "Growth Retainer",
        amount: 235000,
        type: "income",
        category: "Services",
        date: makeDate(4, 8),
      },
      {
        description: "Payroll",
        amount: 112000,
        type: "expense",
        category: "Payroll",
        date: makeDate(4, 24),
      },
      {
        description: "Marketplace Payout",
        amount: 198000,
        type: "income",
        category: "Marketplace",
        date: makeDate(3, 7),
      },
      {
        description: "Performance Marketing",
        amount: 89000,
        type: "expense",
        category: "Marketing",
        date: makeDate(3, 19),
      },
      {
        description: "Renewals Batch",
        amount: 265000,
        type: "income",
        category: "Renewals",
        date: makeDate(2, 6),
      },
      {
        description: "R&D Tools",
        amount: 74000,
        type: "expense",
        category: "Software",
        date: makeDate(2, 20),
      },
      {
        description: "Enterprise Expansion",
        amount: 320000,
        type: "income",
        category: "Enterprise",
        date: makeDate(1, 9),
      },
      {
        description: "Operations",
        amount: 132000,
        type: "expense",
        category: "Operations",
        date: makeDate(1, 22),
      },
      {
        description: "Strategic Partnership",
        amount: 295000,
        type: "income",
        category: "Partnerships",
        date: makeDate(0, 8),
      },
      {
        description: "Compliance & Legal",
        amount: 118000,
        type: "expense",
        category: "Compliance",
        date: makeDate(0, 19),
      },
    ];
  };

  const effectiveTransactions =
    transactions.length > 0 ? transactions : buildDemoTransactions();

  const summary = calculateDashboard(effectiveTransactions);
  const insights = await generateInsights(effectiveTransactions);
  const health = computeHealth(summary);

  res.json({
    ...summary,
    transactions: effectiveTransactions.slice(0, 8),
    insights,
    health,
  });
};
