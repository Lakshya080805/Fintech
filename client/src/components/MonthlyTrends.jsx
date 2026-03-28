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

  const max = Math.max(...rows.map((r) => Math.max(r.income, r.expenses)), 1);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Monthly Trends</div>
        <div className="trend-table-head">
          <span>Income</span>
          <span>Expenses</span>
          <span>Profit / Loss</span>
        </div>
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
                className={`trend-bar ${r.profit < 0 ? "loss" : "profit"}`}
                style={{
                  width: `${Math.max(
                    0,
                    (Math.min(Math.abs(r.profit), max) / max) * 100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="trend-values">
              <span>INR {Math.round(r.income)}</span>
              <span>INR {Math.round(r.expenses)}</span>
              {r.profit < 0 ? (
                <span className="trend-loss">
                  -INR {Math.abs(Math.round(r.profit))}
                </span>
              ) : (
                <span>INR {Math.round(r.profit)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="trend-legend">
        <span className="legend income">Income</span>
        <span className="legend expenses">Expenses</span>
        <span className="legend profit">Profit</span>
        <span className="legend loss">Loss</span>
      </div>
    </div>
  );
}
