"use client";

import { useState, useEffect } from "react";
import { Zap, Search } from "lucide-react";

interface SkillData {
  total: number;
  bundled: number;
  list: Array<{ name: string; category: string }>;
}

export default function SkillsPage() {
  const [data, setData] = useState<SkillData | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/data").then((r) => r.json()).then((d) => {
      setData(d.skills);
    }).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div>
        <h1 className="page-title">Skills</h1>
        <div className="empty-state">
          <Zap className="w-6 h-6" style={{ animation: "pulse 2s infinite" }} />
          <p style={{ marginTop: 12 }}>Loading skills...</p>
        </div>
      </div>
    );
  }

  const filteredSkills = search
    ? data.list.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
      )
    : data.list;

  // Group by category
  const categories: Record<string, Array<{ name: string; category: string }>> = {};
  for (const skill of filteredSkills) {
    if (!categories[skill.category]) categories[skill.category] = [];
    categories[skill.category].push(skill);
  }

  return (
    <div>
      <h1 className="page-title">Skills</h1>
      <p className="page-subtitle">{data.total} skills installed</p>

      {/* Search */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      {/* Skills by category */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {Object.entries(categories).map(([category, skills]) => (
          <div key={category}>
            <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 10 }}>
              {category} ({skills.length})
            </h3>
            <div className="skills-grid">
              {skills.map((skill) => (
                <div key={skill.name} className="skill-card">
                  <div className="skill-name">{skill.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
