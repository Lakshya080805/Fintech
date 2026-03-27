export default function MonthlyTrends({ data = [] }) {
  const rows = data;

  if (!rows.length) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Monthly Trends</div>
          <span className="card-badge">Income vs Expenses</span>
        </div>
        <div className="empty-state">No trend data yet.</div>
      </div>
    );
  }

  const max = Math.max(
    ...rows.map((r) => Math.max(r.income, r.expenses, r.profit)),
    1
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Monthly Trends</div>
        <span className="card-badge">Income vs Expenses</span>
      </div>

      <div className="trend-list">
        {rows.map((r) => (
          <div className="trend-row" key={r.label}>
            <div className="trend-label">{r.label}</div>
            <div className="trend-bars">
              <div
                className="trend-bar income"
                style={{ width: `${(r.income / max) * 100}%` }}
              ></div>
              <div
                className="trend-bar expenses"
                style={{ width: `${(r.expenses / max) * 100}%` }}
              ></div>
              <div
                className="trend-bar profit"
                style={{ width: `${(r.profit / max) * 100}%` }}
              ></div>
            </div>
            <div className="trend-values">
              <span>₹{Math.round(r.income)}</span>
              <span>₹{Math.round(r.expenses)}</span>
              <span>₹{Math.round(r.profit)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="trend-legend">
        <span className="legend income">Income</span>
        <span className="legend expenses">Expenses</span>
        <span className="legend profit">Profit</span>
      </div>
    </div>
  );
}
