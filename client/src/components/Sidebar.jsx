export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">FinSight</div>
        <div className="logo-sub">AI Financial Assistant</div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Overview</div>
        <div className="nav-item active">
          <span className="icon">◫</span> Dashboard
        </div>
        <div className="nav-item">
          <span className="icon">↕</span> Transactions
        </div>
        <div className="nav-item">
          <span className="icon">◇</span> Cash Flow
        </div>
      </div>

      <div className="nav-section" style={{ marginTop: 12 }}>
        <div className="nav-label">Intelligence</div>
        <div className="nav-item">
          <span className="icon">◎</span> AI Insights
        </div>
        <div className="nav-item">
          <span className="icon">◯</span> Forecasting
        </div>
        <div className="nav-item">
          <span className="icon">⚠</span> Alerts
          <span
            style={{
              marginLeft: "auto",
              background: "var(--danger)",
              color: "#fff",
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 20,
              fontWeight: 700,
            }}
          >
            3
          </span>
        </div>
      </div>

      <div className="nav-section" style={{ marginTop: 12 }}>
        <div className="nav-label">Reports</div>
        <div className="nav-item">
          <span className="icon">▦</span> P&L Statement
        </div>
        <div className="nav-item">
          <span className="icon">⊞</span> Tax Summary
        </div>
        <div className="nav-item">
          <span className="icon">⚙</span> Settings
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="business-badge">
          <div className="biz-avatar">A</div>
          <div>
            <div className="biz-name">Arjun's Store</div>
            <div className="biz-plan">Pro Plan ✦</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
