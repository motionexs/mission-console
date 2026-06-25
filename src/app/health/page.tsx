import { prisma } from "@/lib/prisma";
import { Activity, HardDrive, FileText, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHealth() {
  try {
    const [noteCount, skillCount, sessionCount, articleCount] = await Promise.all([
      prisma.vaultNote.count(),
      prisma.skill.count(),
      prisma.session.count(),
      prisma.article.count(),
    ]);

    const totalLines = await prisma.vaultNote.aggregate({ _sum: { lines: true } });

    return {
      noteCount,
      skillCount,
      sessionCount,
      articleCount,
      totalLines: totalLines._sum.lines || 0,
    };
  } catch {
    return { noteCount: 0, skillCount: 0, sessionCount: 0, articleCount: 0, totalLines: 0 };
  }
}

export default async function HealthPage() {
  const health = await getHealth();

  return (
    <div>
      <h1 className="page-title">System Health</h1>
      <p className="page-subtitle">Performance Brain status overview</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span className="stat-label">Notes</span>
          </div>
          <div className="stat-value">{health.noteCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Zap className="w-4 h-4" style={{ color: "var(--green)" }} />
            <span className="stat-label">Skills</span>
          </div>
          <div className="stat-value">{health.skillCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Activity className="w-4 h-4" style={{ color: "var(--amber)" }} />
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-value">{health.sessionCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <HardDrive className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <span className="stat-label">Lines</span>
          </div>
          <div className="stat-value">{health.totalLines.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Vault Location</span>
        </div>
        <div className="card-body">
          <code style={{ fontSize: 13, color: "var(--accent)" }}>
            /Users/elfredfleischman/Documents/obsidian/Elfred Brain/Elfred Brain/
          </code>
        </div>
      </div>
    </div>
  );
}
