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

  const summary = calculateDashboard(transactions);
  const insights = await generateInsights(transactions);
  const health = computeHealth(summary);

  res.json({
    ...summary,
    transactions: transactions.slice(0, 8),
    insights,
    health,
  });
};
