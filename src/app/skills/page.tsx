import { prisma } from "@/lib/prisma";
import { Zap, Package, Puzzle } from "lucide-react";

export const dynamic = "force-dynamic";

async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: [{ source: "asc" }, { name: "asc" }] });
    return skills;
  } catch {
    return [];
  }
}

const sourceConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Active", color: "var(--green)", icon: <Zap className="w-3 h-3" /> },
  optional: { label: "Optional", color: "var(--amber)", icon: <Package className="w-3 h-3" /> },
  plugin: { label: "Plugin", color: "var(--accent)", icon: <Puzzle className="w-3 h-3" /> },
};

export default async function SkillsPage() {
  const skills = await getSkills();

  if (skills.length === 0) {
    return (
      <div>
        <h1 className="page-title">Skills</h1>
        <p className="page-subtitle">No skills synced yet.</p>
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <p>Click "Sync Now" to scan your Hermes skills.</p>
        </div>
      </div>
    );
  }

  const activeCount = skills.filter((s) => s.source === "active").length;
  const optionalCount = skills.filter((s) => s.source === "optional").length;
  const pluginCount = skills.filter((s) => s.source === "plugin").length;

  return (
    <div>
      <h1 className="page-title">Skills</h1>
      <p className="page-subtitle">
        {skills.length} total &middot; {activeCount} active &middot; {optionalCount} optional &middot; {pluginCount} plugins
      </p>

      <div className="skills-grid">
        {skills.map((skill) => {
          const config = sourceConfig[skill.source] || sourceConfig.active;
          return (
            <div key={skill.id} className="skill-card">
              <div className="skill-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: config.color }}>{config.icon}</span>
                {skill.name}
              </div>
              <div className="skill-desc">{skill.description || "No description"}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <span className="badge" style={{ color: config.color }}>
                  {config.label}
                </span>
                {skill.category && (
                  <span className="badge">{skill.category}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
