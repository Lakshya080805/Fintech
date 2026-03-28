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
  const height = 200;
  const plotLeft = 26;
  const plotRight = 8;
  const axisX = 0;
  const padY = 26;
  const labelPad = 16;
  const yTicks = 4;

  const toX = (i) =>
    plotLeft +
    (i * (width - plotLeft - plotRight)) / Math.max(points.length - 1, 1);
  const toY = (v) =>
    height - padY - labelPad - ((v - min) / range) * (height - padY * 2);

  const pathLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.value)}`)
    .join(" ");

  const chartPoints = points.map((p, i) => ({
    ...p,
    x: toX(i),
    y: toY(p.value),
  }));

  const formatAmount = (value) =>
    `INR ${Math.round(value).toLocaleString("en-IN")}`;

  const getLabel = (p) => {
    if (p?.label && /\d{4}/.test(p.label)) {
      return p.label.replace(/\s*(20\d{2})$/, (m, y) => ` '${y.slice(2)}`);
    }
    if (p?.date) {
      const d = new Date(p.date);
      if (!Number.isNaN(d.getTime())) {
        const month = d.toLocaleString("en-US", { month: "short" });
        const year = String(d.getFullYear()).slice(-2);
        return `${month}'${year}`;
      }
    }
    return p?.label || "";
  };

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = max - (i * range) / yTicks;
    return { value: v, y: toY(v) };
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Cash Flow</div>
        <span className="card-badge">Last 6 Months</span>
      </div>

      <div className="chart-wrap">
        <svg className="chart" viewBox={`0 0 ${width} ${height}`}>
          <line
            className="chart-axis"
            x1={axisX}
            y1={padY}
            x2={axisX}
            y2={height - padY}
          />
          <line
            className="chart-axis"
            x1={axisX}
            y1={height - padY - labelPad}
            x2={width - plotRight}
            y2={height - padY - labelPad}
          />
          {ticks.map((t) => (
            <line
              key={`grid-${t.value}`}
              className="chart-grid"
              x1={axisX}
              y1={t.y}
              x2={width - plotRight}
              y2={t.y}
            />
          ))}
          {ticks.map((t) => (
            <text
              key={`y-${t.value}`}
              className="chart-y-label"
              x={axisX - 6}
              y={t.y + 3}
              textAnchor="end"
            >
              {formatAmount(t.value)}
            </text>
          ))}
          <path className="chart-line" d={pathLine} />
          {chartPoints.map((p, idx) => (
            <g key={`${p.label || "p"}-${idx}`}>
              <text
                className="chart-point-label"
                x={p.x}
                y={Math.max(p.y - 10, 12)}
                textAnchor="middle"
              >
                {formatAmount(p.value)}
              </text>
              <circle className="chart-point" cx={p.x} cy={p.y} r="3.5" />
              <title>{`${getLabel(p)}: ${formatAmount(p.value)}`}</title>
            </g>
          ))}
          {points.map((p, idx) => (
            <text
              key={`${p.label || "x"}-${idx}`}
              className="chart-x-label"
              x={toX(idx)}
              y={height - 4}
              textAnchor="middle"
            >
              {getLabel(p)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
