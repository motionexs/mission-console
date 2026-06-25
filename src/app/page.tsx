import { prisma } from "@/lib/prisma";
import { FileText, Zap, MessageSquare, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
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

    const totalLines = await prisma.vaultNote.aggregate({
      _sum: { lines: true },
    });

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
      <h1 className="page-title">Overview</h1>
      <p className="page-subtitle">Your Performance Brain at a glance</p>

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
                <span className="item-title">Research articles</span>
                <Link href="/articles" style={{ fontSize: 13, color: 'var(--accent)' }}>Open →</Link>
              </li>
              <li>
                <span className="item-title">Manage cron jobs</span>
                <Link href="/cron" style={{ fontSize: 13, color: 'var(--accent)' }}>Open →</Link>
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
                <span className="item-title">Status</span>
                <span className="badge green">Online</span>
              </li>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: "blue" | "green" | "amber";
}) {
  const colorMap = {
    blue: "var(--accent)",
    green: "var(--green)",
    amber: "var(--amber)",
  };

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
