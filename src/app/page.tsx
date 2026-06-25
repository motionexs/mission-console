"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, Zap, MessageSquare, Clock, TrendingUp, RefreshCw, CheckCircle, AlertCircle, Loader2, Activity } from "lucide-react";

interface VaultData {
  total: number;
  concepts: number;
  sources: number;
  workflows: number;
  fieldInsights: number;
  totalLines: number;
  folders: Record<string, number>;
  notes: Array<{ title: string; type: string; folder: string; lines: number; words: number }>;
}

interface ApiData {
  vault: VaultData;
  skills: { total: number; bundled: number; list: Array<{ name: string; category: string }> };
  timestamp: string;
}

export default function HomePage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      setData(json);
      setLastSync(new Date());
    } catch (e) {
      console.error("Failed to fetch data:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchData();
    setSyncing(false);
  };

  const timeSince = () => {
    const seconds = Math.floor((Date.now() - lastSync.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    return Math.floor(seconds / 3600) + "h ago";
  };

  if (!data) {
    return (
      <div>
        <h1 className="page-title">Overview</h1>
        <div className="empty-state">
          <Loader2 className="w-6 h-6" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12 }}>Loading Performance Brain...</p>
        </div>
        <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Your Performance Brain at a glance</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Activity className="w-3 h-3" style={{ color: "var(--green)" }} />
              Updated {timeSince()}
            </span>
            <button onClick={handleSync} disabled={syncing} className="btn btn-primary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6, opacity: syncing ? 0.7 : 1 }}>
              {syncing ? <Loader2 className="w-3 h-3" style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw className="w-3 h-3" />}
              {syncing ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<FileText className="w-4 h-4" />} label="Total Notes" value={data.vault.total} color="blue" />
        <StatCard icon={<FileText className="w-4 h-4" />} label="Concepts" value={data.vault.concepts} color="blue" />
        <StatCard icon={<Zap className="w-4 h-4" />} label="Skills" value={data.skills.total} color="green" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Sources" value={data.vault.sources} />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Workflows" value={data.vault.workflows} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Field Insights" value={data.vault.fieldInsights} />
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Lines Written</div>
          <div className="stat-value">{data.vault.totalLines.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Knowledge Folders</div>
          <div className="stat-value">{Object.keys(data.vault.folders).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ color: "#10b981", fontSize: 20 }}>Online</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Links</span>
          </div>
          <div className="card-body">
            <div className="item-list">
              <li>
                <span className="item-title">Browse all vault notes</span>
                <Link href="/vault" style={{ fontSize: 13, color: "var(--accent)" }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">View installed skills</span>
                <Link href="/skills" style={{ fontSize: 13, color: "var(--accent)" }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">System health check</span>
                <Link href="/health" style={{ fontSize: 13, color: "var(--accent)" }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">Research articles</span>
                <Link href="/articles" style={{ fontSize: 13, color: "var(--accent)" }}>Open →</Link>
              </li>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Vault Folders</span>
          </div>
          <div className="card-body">
            <div className="item-list">
              {Object.entries(data.vault.folders).map(([folder, count]) => (
                <li key={folder}>
                  <span className="item-title">{folder}</span>
                  <span className="item-meta">{count} notes</span>
                </li>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color = "blue" }: { icon: React.ReactNode; label: string; value: number; color?: "blue" | "green" | "amber" }) {
  const colorMap = { blue: "var(--accent)", green: "var(--green)", amber: "var(--amber)" };
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <span style={{ color: colorMap[color] }}>{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value.toLocaleString()}</div>
    </div>
  );
}
