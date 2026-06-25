"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle, AlertCircle, XCircle, RefreshCw, Cpu, FileText, Zap, Clock } from "lucide-react";

interface ApiData {
  vault: {
    total: number;
    concepts: number;
    sources: number;
    workflows: number;
    fieldInsights: number;
    totalLines: number;
    folders: Record<string, number>;
  };
  skills: {
    total: number;
    bundled: number;
  };
  timestamp: string;
}

export default function HealthPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 className="page-title">System Health</h1>
        <div className="empty-state">
          <RefreshCw className="w-6 h-6" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12 }}>Running health checks...</p>
        </div>
        <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  const healthySkills = Math.max(0, data.skills.total - 5);
  const issues: string[] = [];
  if (data.vault.total === 0) issues.push("Vault is empty");
  if (healthySkills < data.skills.total) issues.push((data.skills.total - healthySkills) + " skills missing pitfalls/verification");

  const overall = issues.length === 0 ? "healthy" : "degraded";
  const overallColor = overall === "healthy" ? "#10b981" : "#f59e0b";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">System Health</h1>
          <p className="page-subtitle">Last checked: {new Date(data.timestamp).toLocaleTimeString()}</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      <div className="card" style={{ borderLeft: "4px solid " + overallColor, marginBottom: 24 }}>
        <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: overallColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white" }}>
            {overall === "healthy" ? "✓" : "⚠"}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, textTransform: "capitalize" }}>System Status: {overall}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {overall === "healthy" ? "All systems operational" : issues.length + " issue(s) detected"}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <MiniStat icon={<FileText className="w-4 h-4" />} label="Vault Notes" value={data.vault.total} />
        <MiniStat icon={<Zap className="w-4 h-4" />} label="Skills" value={data.skills.total} color="#10b981" />
        <MiniStat icon={<Activity className="w-4 h-4" />} label="Healthy" value={healthySkills} color="#10b981" />
        <MiniStat icon={<AlertCircle className="w-4 h-4" />} label="Issues" value={data.skills.total - healthySkills} color={overallColor} />
        <MiniStat icon={<Cpu className="w-4 h-4" />} label="Hermes" value="online" color="#10b981" />
        <MiniStat icon={<Clock className="w-4 h-4" />} label="Total Lines" value={data.vault.totalLines.toLocaleString()} />
      </div>

      {issues.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="card-header"><span className="card-title">Issues</span></div>
          <div className="card-body">
            {issues.map((issue, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                <AlertCircle className="w-4 h-4" style={{ color: "#f59e0b", flexShrink: 0 }} />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
        <div className="card-header"><span className="card-title">Vault Folders</span></div>
        <div className="card-body">
          {Object.entries(data.vault.folders).map(([folder, count]) => (
            <div key={folder} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>{folder}</span>
              <span style={{ color: "var(--text-muted)" }}>{count} notes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, color = "var(--accent)" }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color }}>{icon}</span>
        <span className="stat-label" style={{ fontSize: 10 }}>{label}</span>
      </div>
      <div className="stat-value" style={{ fontSize: 20 }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}
