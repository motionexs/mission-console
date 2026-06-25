import { prisma } from "@/lib/prisma";
import { FileText, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getNotes() {
  try {
    const notes = await prisma.vaultNote.findMany({
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }],
    });
    return notes;
  } catch {
    return [];
  }
}

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

export default async function VaultPage() {
  const notes = await getNotes();

  if (notes.length === 0) {
    return (
      <div>
        <h1 className="page-title">Vault Notes</h1>
        <p className="page-subtitle">No notes synced yet. Run the sync to populate.</p>
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <p>Your vault data will appear here after syncing.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Vault Notes</h1>
      <p className="page-subtitle">{notes.length} notes indexed</p>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Folder</th>
                <th>Status</th>
                <th>Lines</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td>
                    <span style={{ color: typeColors[note.type] || "var(--text)" }}>
                      {typeLabels[note.type] || note.type}
                    </span>
                    {" "}{note.title}
                  </td>
                  <td><span className="badge">{typeLabels[note.type]}</span></td>
                  <td style={{ color: "var(--text-muted)" }}>{note.folder}</td>
                  <td><span className={`badge ${note.status === "developing" ? "amber" : "green"}`}>{note.status}</span></td>
                  <td>{note.lines}</td>
                  <td style={{ fontSize: 11 }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
