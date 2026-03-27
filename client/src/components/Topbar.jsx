import { useEffect, useRef, useState } from "react";
import api from "../api";

export default function Topbar({ onAdd, onLogout, userName }) {
  const [range, setRange] = useState("monthly");
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const exportReport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await api.get("/api/reports/export", {
        params: { range },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finsight-${range}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="topbar">
      {/* LEFT SIDE */}
      <div>
        <div className="page-title">Financial Overview</div>
        <div className="page-sub">March 2026 · Auto-synced just now</div>
        {userName && <div className="page-user">Signed in as {userName}</div>}
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="topbar-actions">
        <button className="btn btn-ghost" onClick={onAdd}>
          + Add Transaction
        </button>

        <div className="export-menu" ref={menuRef}>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            Export
          </button>
          {open && (
            <div className="export-dropdown">
              <button
                className={`export-option ${range === "monthly" ? "active" : ""}`}
                onClick={() => setRange("monthly")}
              >
                Monthly Report
              </button>
              <button
                className={`export-option ${range === "yearly" ? "active" : ""}`}
                onClick={() => setRange("yearly")}
              >
                Yearly Report
              </button>
              <button
                className={`export-option ${range === "all" ? "active" : ""}`}
                onClick={() => setRange("all")}
              >
                Total Till Date
              </button>
              <div className="export-actions">
                <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={exportReport}>
                  {exporting ? "Exporting..." : "Export PDF"}
                </button>
              </div>
            </div>
          )}
        </div>

        {onLogout && (
          <button className="btn btn-ghost" onClick={onLogout}>
            Log out
          </button>
        )}
      </div>
    </div>
  );
}
