"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Clock,
  Cpu,
  FileText,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SkillHealth {
  name: string;
  status: "healthy" | "missing-files" | "no-skill-md" | "error";
  description: string | null;
  category: string | null;
  hasSkillMd: boolean;
  hasDescription: boolean;
  hasPitfalls: boolean;
  hasVerification: boolean;
  fileCount: number;
  source: string;
  lastModified: string | null;
  issues: string[];
}

interface HealthData {
  overall: "healthy" | "degraded" | "error";
  timestamp: string;
  summary: {
    totalNotes: number;
    totalSkills: number;
    healthySkills: number;
    unhealthySkills: number;
    totalLines: number;
    hermesStatus: "online" | "offline" | "error";
    hermesVersion: string | null;
    activeCronJobs: number;
  };
  issues: string[];
  skillHealth: SkillHealth[];
  hermesHealth: {
    status: string;
    version: string | null;
    activeJobs: number;
    errors: string[];
  };
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  healthy: { color: "#10b981", bg: "rgba(16,185,129,0.15)", icon: CheckCircle, label: "Healthy" },
  "missing-files": { color: "#ef4444", bg: "rgba(239,68,68,0.15)", icon: XCircle, label: "Missing Files" },
  "no-skill-md": { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: AlertCircle, label: "No SKILL.md" },
  error: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: AlertCircle, label: "Issues Found" },
};

function getColorForCount(count: number): string {
  return count > 0 ? "#f59e0b" : "#10b981";
}

function getHermesColor(status: string): string {
  return status === "online" ? "#10b981" : "#ef4444";
}

function getIssuesCountColor(count: number): string {
  return count > 0 ? "#f59e0b" : "#10b981";
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const healthData = await res.json();
      setData(healthData);
    } catch (e) {
      setData({
        overall: "error",
        timestamp: new Date().toISOString(),
        summary: {
          totalNotes: 0, totalSkills: 0, healthySkills: 0, unhealthySkills: 0,
          totalLines: 0, hermesStatus: "offline", hermesVersion: null, activeCronJobs: 0,
        },
        issues: [String(e)],
        skillHealth: [],
        hermesHealth: { status: "error", version: null, activeJobs: 0, errors: [String(e)] },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading && !data) {
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

  if (!data) return null;

  const overallColor = data.overall === "healthy" ? "#10b981" : data.overall === "degraded" ? "#f59e0b" : "#ef4444";
  const unhealthySkills = data.skillHealth.filter((s) => s.status !== "healthy");
  const healthySkills = data.skillHealth.filter((s) => s.status === "healthy");
  const issuesColor = data.issues.length > 0 ? "#f59e0b" : "#10b981";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">System Health</h1>
          <p className="page-subtitle">
            Last checked: {new Date(data.timestamp).toLocaleTimeString()} · Auto-refreshes every 5 min
          </p>
        </div>
        <button onClick={fetchHealth} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw className="w-3 h-3" />
          Check Now
        </button>
      </div>

      <div className="card" style={{ borderLeft: "4px solid " + overallColor, marginBottom: 24 }}>
        <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: overallColor, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "white",
          }}>
            {data.overall === "healthy" ? "✓" : data.overall === "degraded" ? "⚠" : "✗"}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, textTransform: "capitalize" }}>
              System Status: {data.overall}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {data.overall === "healthy"
                ? "All systems operational"
                : data.issues.length + " issue(s) detected"}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <MiniStat icon={<FileText className="w-4 h-4" />} label="Vault Notes" value={data.summary.totalNotes} />
        <MiniStat icon={<Zap className="w-4 h-4" />} label="Skills" value={data.summary.healthySkills + "/" + data.summary.totalSkills} />
        <MiniStat icon={<Activity className="w-4 h-4" />} label="Healthy" value={data.summary.healthySkills} color="#10b981" />
        <MiniStat icon={<AlertCircle className="w-4 h-4" />} label="Issues" value={data.summary.unhealthySkills} color={getIssuesCountColor(data.summary.unhealthySkills)} />
        <MiniStat icon={<Cpu className="w-4 h-4" />} label="Hermes" value={data.summary.hermesStatus} color={getHermesColor(data.summary.hermesStatus)} />
        <MiniStat icon={<Clock className="w-4 h-4" />} label="Cron Jobs" value={data.summary.activeCronJobs} />
      </div>

      {data.issues.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="card-header">
            <span className="card-title">⚠ Issues ({data.issues.length})</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.issues.map((issue, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <AlertCircle className="w-4 h-4" style={{ color: "#f59e0b", flexShrink: 0 }} />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {unhealthySkills.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="card-header">
            <span className="card-title">⚡ Skills with Issues ({unhealthySkills.length})</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {unhealthySkills.map((skill) => {
                const config = statusConfig[skill.status];
                const isExpanded = expandedSkill === skill.name;
                const StatusIcon = config.icon;

                return (
                  <div key={skill.name} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <div
                      onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        cursor: "pointer", background: "var(--bg-hover)",
                      }}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <StatusIcon className="w-4 h-4" style={{ color: config.color }} />
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{skill.name}</span>
                      <span className="badge" style={{ color: config.color, background: config.bg }}>
                        {config.label}
                      </span>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                        {skill.issues.length} issue(s)
                      </span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                          <div><span style={{ color: "var(--text-muted)" }}>Source:</span> {skill.source}</div>
                          <div><span style={{ color: "var(--text-muted)" }}>Files:</span> {skill.fileCount}</div>
                          <div><span style={{ color: "var(--text-muted)" }}>SKILL.md:</span> {skill.hasSkillMd ? "✓" : "✗"}</div>
                          <div><span style={{ color: "var(--text-muted)" }}>Description:</span> {skill.hasDescription ? "✓" : "✗"}</div>
                          <div><span style={{ color: "var(--text-muted)" }}>Pitfalls:</span> {skill.hasPitfalls ? "✓" : "✗"}</div>
                          <div><span style={{ color: "var(--text-muted)" }}>Verification:</span> {skill.hasVerification ? "✓" : "✗"}</div>
                        </div>
                        {skill.issues.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                            {skill.issues.map((issue, i) => (
                              <div key={i} style={{ fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 6 }}>
                                <span>•</span> {issue}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
        <div className="card-header">
          <span className="card-title">✓ Healthy Skills ({healthySkills.length})</span>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {healthySkills.map((skill) => (
              <span key={skill.name} className="badge" style={{ color: "#10b981", background: "rgba(16,185,129,0.15)" }}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Hermes Agent Status</span>
        </div>
        <div className="card-body">
          <div className="item-list">
            <li>
              <span className="item-title">CLI Status</span>
              <span className="badge" style={{
                color: data.hermesHealth.status === "online" ? "#10b981" : "#ef4444",
                background: data.hermesHealth.status === "online" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              }}>
                {data.hermesHealth.status}
              </span>
            </li>
            <li>
              <span className="item-title">Version</span>
              <span className="item-meta">{data.hermesHealth.version || "Unknown"}</span>
            </li>
            <li>
              <span className="item-title">Active Cron Jobs</span>
              <span className="item-meta">{data.hermesHealth.activeJobs}</span>
            </li>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon, label, value, color = "var(--accent)",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color }}>{icon}</span>
        <span className="stat-label" style={{ fontSize: 10 }}>{label}</span>
      </div>
      <div className="stat-value" style={{ fontSize: 20 }}>{value}</div>
    </div>
  );
}
