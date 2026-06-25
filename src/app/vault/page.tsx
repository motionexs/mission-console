"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, RefreshCw, CheckCircle, Loader2 } from "lucide-react";

interface VaultNotes {
  total: number;
  concepts: number;
  sources: number;
  workflows: number;
  fieldInsights: number;
  totalLines: number;
  folders: Record<string, number>;
  notes: Array<{ title: string; type: string; folder: string; lines: number; words: number }>;
}

export default function VaultPage() {
  const [data, setData] = useState<VaultNotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/data").then((r) => r.json()).then((d) => {
      setData(d.vault);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 className="page-title">Vault</h1>
        <div className="empty-state">
          <Loader2 className="w-6 h-6" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12 }}>Loading vault...</p>
        </div>
        <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  const filteredNotes = filter === "all"
    ? data.notes
    : data.notes.filter((n) => n.type === filter);

  const typeColors: Record<string, string> = {
    concept: "var(--accent)",
    source: "var(--green)",
    workflow: "var(--amber)",
    "field-insight": "var(--orange)",
  };

  const typeLabels: Record<string, string> = {
    concept: "Concept",
    source: "Source",
    workflow: "Workflow",
    "field-insight": "Field Insight",
  };

  const filters = [
    { key: "all", label: "All (" + data.total + ")" },
    { key: "concept", label: "Concepts (" + data.concepts + ")" },
    { key: "source", label: "Sources (" + data.sources + ")" },
    { key: "workflow", label: "Workflows (" + data.workflows + ")" },
    { key: "field-insight", label: "Field Insights (" + data.fieldInsights + ")" },
  ];

  return (
    <div>
      <h1 className="page-title">Vault Notes</h1>
      <p className="page-subtitle">{data.total} notes · {data.totalLines.toLocaleString()} lines</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="btn btn-sm"
            style={{
              background: filter === f.key ? "var(--accent)" : "var(--bg-hover)",
              color: filter === f.key ? "white" : "var(--text-secondary)",
              border: filter === f.key ? "1px solid var(--accent)" : "1px solid var(--border)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Title</th>
                <th>Type</th>
                <th>Folder</th>
                <th style={{ textAlign: "right" }}>Lines</th>
                <th style={{ textAlign: "right" }}>Words</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note) => (
                <tr key={note.title}>
                  <td>
                    <span style={{ color: typeColors[note.type] || "var(--text)" }}>
                      {typeLabels[note.type] || note.type}
                    </span>
                    {" "}
                    <span style={{ color: "var(--text)" }}>{note.title.replace("Concept - ", "").replace("Source - ", "").replace("Workflow - ", "").replace("Field Insight - ", "")}</span>
                  </td>
                  <td><span className="badge">{typeLabels[note.type]}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{note.folder}</td>
                  <td style={{ textAlign: "right" }}>{note.lines}</td>
                  <td style={{ textAlign: "right" }}>{note.words}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
