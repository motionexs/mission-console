import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// On Vercel, vault files are in the /vault directory of the repo
// On local, use the Obsidian path
const VAULT_PATH = process.env.VERCEL
  ? path.join(process.cwd(), "vault")
  : "/Users/elfredfleischman/Documents/obsidian/Elfred Brain/Elfred Brain";

// ─── Vault Scanner ───────────────────────────────────────────────────────────

function getNoteType(filename: string): string | null {
  if (filename.startsWith("Concept - ")) return "concept";
  if (filename.startsWith("Source - ")) return "source";
  if (filename.startsWith("Workflow - ")) return "workflow";
  if (filename.startsWith("Field Insight - ")) return "field-insight";
  return null;
}

function getFolderName(filePath: string): string {
  const relative = path.relative(VAULT_PATH, filePath);
  const parts = relative.split(path.sep);
  return parts.length > 1 ? parts[0] : "Root";
}

async function scanVault() {
  const notes: Array<{
    title: string;
    type: string;
    folder: string;
    lines: number;
    words: number;
  }> = [];

  async function walk(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
            await walk(fullPath);
          }
        } else if (entry.name.endsWith(".md")) {
          const type = getNoteType(entry.name);
          if (type) {
            const content = await fs.readFile(fullPath, "utf-8");
            const lines = content.split("\n").length;
            const words = content.split(/\s+/).filter(Boolean).length;
            notes.push({
              title: entry.name.replace(".md", ""),
              type,
              folder: getFolderName(fullPath),
              lines,
              words,
            });
          }
        }
      }
    } catch {}
  }

  await walk(VAULT_PATH);
  return notes;
}

// ─── Skills (Hermes Catalog) ────────────────────────────────────────────────

const ALL_HERMES_SKILLS: Array<{ name: string; category: string }> = [
  { name: "apple-notes", category: "apple" },
  { name: "apple-reminders", category: "apple" },
  { name: "findmy", category: "apple" },
  { name: "imessage", category: "apple" },
  { name: "macos-computer-use", category: "apple" },
  { name: "claude-code", category: "autonomous-ai-agents" },
  { name: "codex", category: "autonomous-ai-agents" },
  { name: "hermes-agent", category: "autonomous-ai-agents" },
  { name: "opencode", category: "autonomous-ai-agents" },
  { name: "research-team-sports-science", category: "autonomous-ai-agents" },
  { name: "computer-use", category: "computer-use" },
  { name: "architecture-diagram", category: "creative" },
  { name: "ascii-art", category: "creative" },
  { name: "ascii-video", category: "creative" },
  { name: "baoyu-infographic", category: "creative" },
  { name: "claude-design", category: "creative" },
  { name: "comfyui", category: "creative" },
  { name: "design-md", category: "creative" },
  { name: "excalidraw", category: "creative" },
  { name: "humanizer", category: "creative" },
  { name: "manim-video", category: "creative" },
  { name: "p5js", category: "creative" },
  { name: "popular-web-designs", category: "creative" },
  { name: "pretext", category: "creative" },
  { name: "sketch", category: "creative" },
  { name: "songwriting-and-ai-music", category: "creative" },
  { name: "touchdesigner-mcp", category: "creative" },
  { name: "jupyter-live-kernel", category: "data-science" },
  { name: "kanban-orchestrator", category: "devops" },
  { name: "kanban-worker", category: "devops" },
  { name: "dogfood", category: "dogfood" },
  { name: "himalaya", category: "email" },
  { name: "codebase-inspection", category: "github" },
  { name: "github-auth", category: "github" },
  { name: "github-code-review", category: "github" },
  { name: "github-issues", category: "github" },
  { name: "github-pr-workflow", category: "github" },
  { name: "github-repo-management", category: "github" },
  { name: "gif-search", category: "media" },
  { name: "heartmula", category: "media" },
  { name: "songsee", category: "media" },
  { name: "youtube-content", category: "media" },
  { name: "audiocraft-audio-generation", category: "mlops" },
  { name: "evaluating-llms-harness", category: "mlops" },
  { name: "huggingface-hub", category: "mlops" },
  { name: "llama-cpp", category: "mlops" },
  { name: "segment-anything-model", category: "mlops" },
  { name: "serving-llms-vllm", category: "mlops" },
  { name: "weights-and-biases", category: "mlops" },
  { name: "librarian-agent", category: "note-taking" },
  { name: "obsidian", category: "note-taking" },
  { name: "airtable", category: "productivity" },
  { name: "google-workspace", category: "productivity" },
  { name: "maps", category: "productivity" },
  { name: "nano-pdf", category: "productivity" },
  { name: "notion", category: "productivity" },
  { name: "ocr-and-documents", category: "productivity" },
  { name: "powerpoint", category: "productivity" },
  { name: "teams-meeting-pipeline", category: "productivity" },
  { name: "arxiv", category: "research" },
  { name: "blogwatcher", category: "research" },
  { name: "llm-wiki", category: "research" },
  { name: "polymarket", category: "research" },
  { name: "research-paper-writing", category: "research" },
  { name: "openhue", category: "smart-home" },
  { name: "xurl", category: "social-media" },
  { name: "hermes-agent-skill-authoring", category: "software-development" },
  { name: "node-inspect-debugger", category: "software-development" },
  { name: "plan", category: "software-development" },
  { name: "python-debugpy", category: "software-development" },
  { name: "requesting-code-review", category: "software-development" },
  { name: "simplify-code", category: "software-development" },
  { name: "spike", category: "software-development" },
  { name: "systematic-debugging", category: "software-development" },
  { name: "test-driven-development", category: "software-development" },
  { name: "yuanbao", category: "yuanbao" },
];

// ─── Data API ───────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const notes = await scanVault();
    const concepts = notes.filter((n) => n.type === "concept").length;
    const sources = notes.filter((n) => n.type === "source").length;
    const workflows = notes.filter((n) => n.type === "workflow").length;
    const fieldInsights = notes.filter((n) => n.type === "field-insight").length;
    const totalLines = notes.reduce((sum, n) => sum + n.lines, 0);

    const folderMap: Record<string, number> = {};
    for (const note of notes) {
      folderMap[note.folder] = (folderMap[note.folder] || 0) + 1;
    }

    return NextResponse.json({
      vault: {
        total: notes.length,
        concepts,
        sources,
        workflows,
        fieldInsights,
        totalLines,
        folders: folderMap,
        notes: notes.map((n) => ({
          title: n.title,
          type: n.type,
          folder: n.folder,
          lines: n.lines,
          words: n.words,
        })),
      },
      skills: {
        total: ALL_HERMES_SKILLS.length,
        bundled: ALL_HERMES_SKILLS.length,
        list: ALL_HERMES_SKILLS,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
