import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

async function getSessions() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return sessions;
  } catch {
    return [];
  }
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  if (sessions.length === 0) {
    return (
      <div>
        <h1 className="page-title">Sessions</h1>
        <p className="page-subtitle">No sessions recorded yet.</p>
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>Session history will appear here as you use Hermes.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Sessions</h1>
      <p className="page-subtitle">Recent Hermes conversation sessions</p>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Source</th>
                <th>Messages</th>
                <th>Tokens</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.title || "Untitled"}</td>
                  <td><span className="badge">{s.source}</span></td>
                  <td>{s.messages}</td>
                  <td>{(s.tokensIn + s.tokensOut).toLocaleString()}</td>
                  <td style={{ fontSize: 11 }}>
                    {new Date(s.createdAt).toLocaleDateString()}
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
