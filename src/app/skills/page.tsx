import { prisma } from "@/lib/prisma";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: "asc" } });
    return skills;
  } catch {
    return [];
  }
}

export default async function SkillsPage() {
  const skills = await getSkills();

  if (skills.length === 0) {
    return (
      <div>
        <h1 className="page-title">Skills</h1>
        <p className="page-subtitle">No skills synced yet.</p>
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <p>Run the sync to index your installed Hermes skills.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Skills</h1>
      <p className="page-subtitle">{skills.length} installed skills</p>

      <div className="skills-grid">
        {skills.map((skill) => (
          <div key={skill.id} className="skill-card">
            <div className="skill-name">{skill.name}</div>
            <div className="skill-desc">{skill.description || "No description"}</div>
            {skill.category && <div className="skill-category">{skill.category}</div>}
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${skill.isActive ? "green" : ""}`}>
                {skill.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
