import { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CashFlowChart from "../components/CashFlowChart";
import MonthlyTrends from "../components/MonthlyTrends";

export default function CashFlowPage({ onLogout, user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/dashboard")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cash flow:", err);
        if (err?.response?.status === 401 && onLogout) {
          onLogout();
          return;
        }
        setLoading(false);
      });
  }, [onLogout]);

  return (
    <div className="layout">
      <Sidebar
        userName={user?.businessName || user?.name}
        onLogout={onLogout}
        activeView="cashflow"
        onNavigate={onNavigate}
      />

      <main className="main">
        <Topbar onLogout={onLogout} userName={user?.name} />

        {loading ? (
          <div style={{ padding: 20 }}>Loading cash flow...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <CashFlowChart data={data?.cashFlowSeries} />
            <MonthlyTrends data={data?.monthlyTrends} />
          </div>
        )}
      </main>
    </div>
  );
}
