const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};

export const calculateDashboard = (transactions) => {
  let income = 0;
  let expenses = 0;

  const categories = {};
  const expenseCategories = {};
  const monthly = {};

  transactions.forEach((t) => {
    const amount = Number(t.amount || 0);
    if (t.type === "income") income += amount;
    else expenses += amount;

    if (t.category) {
      categories[t.category] = (categories[t.category] || 0) + amount;
      if (t.type === "expense") {
        expenseCategories[t.category] =
          (expenseCategories[t.category] || 0) + amount;
      }
    }

    if (t.date) {
      const key = monthKey(t.date);
      if (!monthly[key]) monthly[key] = { income: 0, expenses: 0 };
      if (t.type === "income") monthly[key].income += amount;
      else monthly[key].expenses += amount;
    }
  });

  const sortedMonths = Object.keys(monthly).sort();
  const lastMonths = sortedMonths.slice(-6);
  const monthlyTrends = lastMonths.map((key) => ({
    key,
    label: monthLabel(key),
    income: monthly[key].income,
    expenses: monthly[key].expenses,
    profit: monthly[key].income - monthly[key].expenses,
  }));

  const cashFlowSeries = monthlyTrends.map((m) => ({
    label: m.label,
    value: m.income - m.expenses,
  }));

  const expenseBreakdown = Object.entries(expenseCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return {
    revenue: income,
    expenses,
    profit: income - expenses,
    categories,
    expenseBreakdown,
    monthlyTrends,
    cashFlowSeries,
  };
};
