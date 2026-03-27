export default function CashFlowChart({ data = [] }) {
  const points = data;

  if (!points.length) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Cash Flow</div>
          <span className="card-badge">Last 6 Months</span>
        </div>
        <div className="empty-state">No cash flow data yet.</div>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  const width = 600;
  const height = 180;
  const pad = 20;

  const toX = (i) =>
    pad + (i * (width - pad * 2)) / Math.max(points.length - 1, 1);
  const toY = (v) =>
    height - pad - ((v - min) / range) * (height - pad * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.value)}`)
    .join(" ");

  const chartPoints = points.map((p, i) => ({
    ...p,
    x: toX(i),
    y: toY(p.value),
  }));

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Cash Flow</div>
        <span className="card-badge">Last 6 Months</span>
      </div>

      <div className="chart-wrap">
        <svg className="chart" viewBox={`0 0 ${width} ${height}`}>
          <path className="chart-line" d={path} />
          {chartPoints.map((p) => (
            <g key={p.label}>
              <circle className="chart-point" cx={p.x} cy={p.y} r="3.5" />
              <title>{`${p.label}: ₹${Math.round(p.value)}`}</title>
            </g>
          ))}
        </svg>
      </div>

      <div
        className="chart-labels"
        style={{ gridTemplateColumns: `repeat(${points.length}, 1fr)` }}
      >
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
