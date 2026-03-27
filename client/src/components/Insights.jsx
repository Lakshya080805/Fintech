export default function Insights({ data }) {
  const items =
    data && data.length
      ? data
      : [
          {
            type: "danger",
            emoji: "!",
            title: "Software costs spiking",
            desc:
              "Software spend is above normal. Review unused subscriptions and negotiate annual plans.",
          },
          {
            type: "warning",
            emoji: "*",
            title: "Seasonal opportunity",
            desc:
              "April historically shows higher revenue. Ensure inventory and staffing are ready.",
          },
          {
            type: "info",
            emoji: "+",
            title: "Strong collections",
            desc:
              "Most invoices are paid on time. Maintain current follow-up cadence.",
          },
        ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">AI Insights</div>
        <span className="card-badge">{items.length} New</span>
      </div>

      <div className="insights-list">
        {items.map((item, i) => (
          <div
            className={`insight-card ${item.type === "danger" ? "danger" : ""}${
              item.type === "warning" ? " warning" : ""
            }`}
            key={i}
          >
            <div className="insight-emoji">{item.emoji}</div>
            <div className="insight-body">
              <div className="insight-title">{item.title}</div>
              <div className="insight-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
