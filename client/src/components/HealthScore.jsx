export default function HealthScore({ data }) {
  if (!data) return null;

  const score = Math.round(data.score || 0);
  const label = data.label || "";
  const message = data.message || "";

  const profitMargin = Math.max(0, Math.min(1, data.profitMargin || 0));
  const expenseRatio = Math.max(0, Math.min(1, data.expenseRatio || 0));
  const liquidityRatio = Math.max(0, Math.min(3, data.liquidityRatio || 0));
  const revenueGrowth = data.revenueGrowth || 0;

  const circle = 2 * Math.PI * 34;
  const dash = (score / 100) * circle;

  return (
    <div className="card health-card">
      <div className="card-title">Financial Health Score</div>

      <div className="health-main">
        <div className="health-ring">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle className="health-ring-bg" cx="48" cy="48" r="34" />
            <circle
              className="health-ring-progress"
              cx="48"
              cy="48"
              r="34"
              strokeDasharray={`${dash} ${circle}`}
            />
          </svg>
          <div className="health-score">{score}</div>
        </div>

        <div className="health-summary">
          <div className="health-label">{label}</div>
          <div className="health-message">{message}</div>
        </div>
      </div>

      <div className="health-metrics">
        <div className="health-row">
          <div className="health-name">Profit Margin</div>
          <div className="health-bar">
            <span style={{ width: `${profitMargin * 100}%` }}></span>
          </div>
          <div className="health-value">{(profitMargin * 100).toFixed(1)}%</div>
        </div>

        <div className="health-row">
          <div className="health-name">Liquidity Ratio</div>
          <div className="health-bar">
            <span style={{ width: `${(liquidityRatio / 3) * 100}%` }}></span>
          </div>
          <div className="health-value">{liquidityRatio.toFixed(1)}x</div>
        </div>

        <div className="health-row">
          <div className="health-name">Expense Ratio</div>
          <div className="health-bar danger">
            <span style={{ width: `${expenseRatio * 100}%` }}></span>
          </div>
          <div className="health-value">{(expenseRatio * 100).toFixed(1)}%</div>
        </div>

        <div className="health-row">
          <div className="health-name">Revenue Growth</div>
          <div className="health-bar accent">
            <span style={{ width: `${Math.max(0, Math.min(1, revenueGrowth)) * 100}%` }}></span>
          </div>
          <div className="health-value">
            {revenueGrowth >= 0 ? "+" : ""}{(revenueGrowth * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
