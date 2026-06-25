"use client";

import { useState, useEffect, useCallback } from "react";
import { prisma } from "@/lib/prisma";
import { FileText, Zap, MessageSquare, Clock, TrendingUp, RefreshCw, CheckCircle, AlertCircle, Loader2, Activity } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Summary {
  notes: number;
  concepts: number;
  sources: number;
  workflows: number;
  fieldInsights: number;
  totalLines: number;
  skills: number;
  sessions: number;
  jobs: number;
  articles: number;
}

async function getStats(): Promise<Summary> {
  try {
    const [notes, skills, sessions, jobs, articles] = await Promise.all([
      prisma.vaultNote.count(),
      prisma.skill.count(),
      prisma.session.count(),
      prisma.cronJob.count(),
      prisma.article.count(),
    ]);

    const concepts = await prisma.vaultNote.count({ where: { type: "concept" } });
    const sources = await prisma.vaultNote.count({ where: { type: "source" } });
    const workflows = await prisma.vaultNote.count({ where: { type: "workflow" } });
    const fieldInsights = await prisma.vaultNote.count({ where: { type: "field-insight" } });

    const totalLines = await prisma.vaultNote.aggregate({ _sum: { lines: true } });

    return {
      notes, concepts, sources, workflows, fieldInsights,
      totalLines: totalLines._sum.lines || 0,
      skills, sessions, jobs, articles,
    };
  } catch {
    return {
      notes: 0, concepts: 0, sources: 0, workflows: 0, fieldInsights: 0,
      totalLines: 0, skills: 0, sessions: 0, jobs: 0, articles: 0,
    };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Your Performance Brain at a glance</p>
        </div>
        <SyncButton />
      </div>

      <div className="stats-grid">
        <StatCard icon={<FileText className="w-4 h-4" />} label="Total Notes" value={stats.notes} color="blue" />
        <StatCard icon={<FileText className="w-4 h-4" />} label="Concepts" value={stats.concepts} color="blue" />
        <StatCard icon={<Zap className="w-4 h-4" />} label="Skills" value={stats.skills} color="green" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Sessions" value={stats.sessions} />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Cron Jobs" value={stats.jobs} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Articles" value={stats.articles} />
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Lines Written</div>
          <div className="stat-value">{stats.totalLines.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Workflows</div>
          <div className="stat-value">{stats.workflows}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Field Insights</div>
          <div className="stat-value">{stats.fieldInsights}</div>
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
                <Link href="/vault" style={{ fontSize: 13, color: 'var(--accent)' }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">View installed skills</span>
                <Link href="/skills" style={{ fontSize: 13, color: 'var(--accent)' }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">System health check</span>
                <Link href="/health" style={{ fontSize: 13, color: 'var(--accent)' }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">Research articles</span>
                <Link href="/articles" style={{ fontSize: 13, color: 'var(--accent)' }}>Open →</Link>
              </li>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">System Info</span>
          </div>
          <div className="card-body">
            <div className="item-list">
              <li>
                <span className="item-title">Vault Path</span>
                <span className="item-meta" style={{ fontSize: 11 }}>Obsidian/Elfred Brain/</span>
              </li>
              <li>
                <span className="item-title">Database</span>
                <span className="item-meta">SQLite (local)</span>
              </li>
              <li>
                <span className="item-title">Stack</span>
                <span className="item-meta">Next.js + Prisma</span>
              </li>
              <li>
                <span className="item-title">Auto-Sync</span>
                <span className="badge green">Every 5 min</span>
              </li>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Auto-sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      await handleSyncInternal(setSyncing, setResult, setLastSync, false);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    await handleSyncInternal(setSyncing, setResult, setLastSync, true);
  };

  const timeSince = () => {
    const seconds = Math.floor((Date.now() - lastSync.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    return Math.floor(seconds / 3600) + "h ago";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Activity className="w-3 h-3" style={{ color: "var(--green)" }} />
          Last sync: {timeSince()}
        </span>
        <button onClick={handleSync} disabled={syncing} className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6, opacity: syncing ? 0.7 : 1, cursor: syncing ? "not-allowed" : "pointer" }}>
          {syncing ? <Loader2 className="w-3 h-3" style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw className="w-3 h-3" />}
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>
      {result && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12,
          color: result.success ? "var(--green)" : "var(--red)", maxWidth: 300 }}>
          {result.success ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span style={{ textAlign: "right" }}>{result.message}</span>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

async function handleSyncInternal(
  setSyncing: (v: boolean) => void,
  setResult: (r: { success: boolean; message: string } | null) => void,
  setLastSync: (d: Date) => void,
  showResult: boolean,
) {
  setSyncing(true);
  if (showResult) setResult(null);
  try {
    const res = await fetch("/api/sync", { method: "POST" });
    const data = await res.json();
    if (data.success && showResult) {
      setResult({
        success: true,
        message: `Synced: ${data.results.vault.synced} notes, ${data.results.skills.synced} skills`,
      });
    }
    setLastSync(new Date());
  } catch (e) {
    if (showResult) setResult({ success: false, message: String(e) });
  } finally {
    setSyncing(false);
  }
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
