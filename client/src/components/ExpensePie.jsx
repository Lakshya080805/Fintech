const COLORS = [
  "var(--accent2)",
  "var(--accent)",
  "var(--accent3)",
  "var(--danger)",
  "#9b7ff7",
  "#4ad8e0",
];

export default function ExpensePie({ data = [] }) {
  const items = data;

  if (!items.length) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Expense Breakdown</div>
          <span className="card-badge">This Month</span>
        </div>
        <div className="empty-state">No expense data yet.</div>
      </div>
    );
  }

  const totalValue = items.reduce((acc, i) => acc + i.value, 0);
  const total = totalValue || 1;
  let cumulative = 0;

  const slices = items.map((item, idx) => {
    const value = item.value / total;
    const start = cumulative;
    cumulative += value;
    return {
      ...item,
      start,
      end: cumulative,
      color: COLORS[idx % COLORS.length],
    };
  });

  const radius = 70;
  const cx = 90;
  const cy = 90;

  const describeArc = (start, end) => {
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = end * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = end - start > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const drawableSlices = slices.filter((s) => s.value > 0);
  const singleFullSlice = drawableSlices.length === 1;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Expense Breakdown</div>
        <span className="card-badge">This Month</span>
      </div>

      <div className="pie-wrap">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {singleFullSlice ? (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={drawableSlices[0].color}
            />
          ) : (
            drawableSlices.map((s) => (
              <path key={s.name} d={describeArc(s.start, s.end)} fill={s.color} />
            ))
          )}
        </svg>
        <div className="pie-center">
          <div className="pie-total">&#8377;{Math.round(total)}</div>
          <div className="pie-label">Expenses</div>
        </div>
      </div>

      <div className="pie-legend">
        {slices.map((s) => (
          <div key={s.name} className="pie-item">
            <span className="pie-dot" style={{ background: s.color }}></span>
            <span className="pie-name">{s.name}</span>
            <span className="pie-amount">&#8377;{Math.round(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
