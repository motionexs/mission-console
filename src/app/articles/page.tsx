import { prisma } from "@/lib/prisma";
import { FileText, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { year: "desc" },
    });
    return articles;
  } catch {
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return (
      <div>
        <h1 className="page-title">Articles</h1>
        <p className="page-subtitle">No articles indexed yet.</p>
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <p>Add research articles to your vault to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Articles</h1>
      <p className="page-subtitle">{articles.length} research papers</p>

      <div className="card">
        <div className="card-body">
          <div className="item-list">
            {articles.map((a) => (
              <li key={a.id}>
                <div>
                  <div className="item-title">{a.title}</div>
                  <div className="item-meta" style={{ marginTop: 4 }}>
                    {a.authors} · {a.journal} ({a.year})
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {a.url && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}
                    >
                      DOI ↗
                    </a>
                  )}
                  {a.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${a.pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}
                    >
                      PubMed ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
