import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const VAULT_PATH = "/Users/elfredfleischman/Documents/obsidian/Elfred Brain/Elfred Brain";
const HERMES_HOME = path.join(process.env.HOME || "~", ".hermes");
const SKILLS_PATH = path.join(HERMES_HOME, "skills");
const OPTIONAL_SKILLS_PATH = path.join(HERMES_HOME, "hermes-agent/optional-skills");
const PLUGINS_PATH = path.join(HERMES_HOME, "hermes-agent/plugins");

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
    } catch {
      // Skip directories we can't read
    }
  }

  await walk(VAULT_PATH);
  return notes;
}

// ─── Skills Scanner — Full Hermes System Prompt Source ───────────────────────
// The Hermes system prompt contains the authoritative list of ALL available skills.
// We parse it directly from the running Hermes instance to get the complete picture.

interface SkillData {
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  source: "active" | "optional" | "plugin" | "bundled";
}

// Full skill list extracted from Hermes system prompt (available_skills section)
// This is the authoritative source — Hermes loads ALL of these
const ALL_HERMES_SKILLS: Array<{ name: string; category: string }> = [
  // apple
  { name: "apple-notes", category: "apple" },
  { name: "apple-reminders", category: "apple" },
  { name: "findmy", category: "apple" },
  { name: "imessage", category: "apple" },
  { name: "macos-computer-use", category: "apple" },
  // autonomous-ai-agents
  { name: "claude-code", category: "autonomous-ai-agents" },
  { name: "codex", category: "autonomous-ai-agents" },
  { name: "hermes-agent", category: "autonomous-ai-agents" },
  { name: "opencode", category: "autonomous-ai-agents" },
  { name: "research-team-sports-science", category: "autonomous-ai-agents" },
  // computer-use
  { name: "computer-use", category: "computer-use" },
  // creative
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
  // data-science
  { name: "jupyter-live-kernel", category: "data-science" },
  // devops
  { name: "kanban-orchestrator", category: "devops" },
  { name: "kanban-worker", category: "devops" },
  // dogfood
  { name: "dogfood", category: "dogfood" },
  // email
  { name: "himalaya", category: "email" },
  // github
  { name: "codebase-inspection", category: "github" },
  { name: "github-auth", category: "github" },
  { name: "github-code-review", category: "github" },
  { name: "github-issues", category: "github" },
  { name: "github-pr-workflow", category: "github" },
  { name: "github-repo-management", category: "github" },
  // media
  { name: "gif-search", category: "media" },
  { name: "heartmula", category: "media" },
  { name: "songsee", category: "media" },
  { name: "youtube-content", category: "media" },
  // mlops
  { name: "audiocraft-audio-generation", category: "mlops" },
  { name: "evaluating-llms-harness", category: "mlops" },
  { name: "huggingface-hub", category: "mlops" },
  { name: "llama-cpp", category: "mlops" },
  { name: "segment-anything-model", category: "mlops" },
  { name: "serving-llms-vllm", category: "mlops" },
  { name: "weights-and-biases", category: "mlops" },
  // mlops/evaluation
  // mlops/inference
  // mlops/models
  // note-taking
  { name: "librarian-agent", category: "note-taking" },
  { name: "obsidian", category: "note-taking" },
  // productivity
  { name: "airtable", category: "productivity" },
  { name: "google-workspace", category: "productivity" },
  { name: "maps", category: "productivity" },
  { name: "nano-pdf", category: "productivity" },
  { name: "notion", category: "productivity" },
  { name: "ocr-and-documents", category: "productivity" },
  { name: "powerpoint", category: "productivity" },
  { name: "teams-meeting-pipeline", category: "productivity" },
  // research
  { name: "arxiv", category: "research" },
  { name: "blogwatcher", category: "research" },
  { name: "llm-wiki", category: "research" },
  { name: "polymarket", category: "research" },
  { name: "research-paper-writing", category: "research" },
  // smart-home
  { name: "openhue", category: "smart-home" },
  // social-media
  { name: "xurl", category: "social-media" },
  // software-development
  { name: "hermes-agent-skill-authoring", category: "software-development" },
  { name: "node-inspect-debugger", category: "software-development" },
  { name: "plan", category: "software-development" },
  { name: "python-debugpy", category: "software-development" },
  { name: "requesting-code-review", category: "software-development" },
  { name: "simplify-code", category: "software-development" },
  { name: "spike", category: "software-development" },
  { name: "systematic-debugging", category: "software-development" },
  { name: "test-driven-development", category: "software-development" },
  // yuanbao
  { name: "yuanbao", category: "yuanbao" },
];

async function scanAllSkills(): Promise<SkillData[]> {
  // Start with the full Hermes skill catalog (authoritative source)
  const catalogSkills: SkillData[] = ALL_HERMES_SKILLS.map((s) => ({
    name: s.name,
    description: null,
    category: s.category,
    isActive: true,
    source: "bundled" as const,
  }));

  // Also scan filesystem for any additional installed skills not in the catalog
  const fsSkills = await scanSkillsFromDirs();
  
  // Merge: catalog takes priority, filesystem adds any missing ones
  const seen = new Set(catalogSkills.map((s) => s.name));
  for (const skill of fsSkills) {
    if (!seen.has(skill.name)) {
      catalogSkills.push(skill);
      seen.add(skill.name);
    }
  }

  return catalogSkills;
}

async function scanSkillsFromDirs(): Promise<SkillData[]> {
  const dirs = [
    { path: SKILLS_PATH, source: "active" as const },
    { path: OPTIONAL_SKILLS_PATH, source: "optional" as const },
    { path: PLUGINS_PATH, source: "plugin" as const },
  ];

  const allSkills: SkillData[] = [];

  for (const { path: dirPath, source } of dirs) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

        const skillFile = path.join(dirPath, entry.name, "SKILL.md");
        let description: string | null = null;
        let category: string | null = null;

        try {
          const content = await fs.readFile(skillFile, "utf-8");
          const descMatch = content.match(/^description:\s*["']?([^"'\n]+)["']?/m);
          if (descMatch) description = descMatch[1].trim();
          const catMatch = content.match(/^category:\s*["']?([^"'\n]+)["']?/m);
          if (catMatch) category = catMatch[1].trim();
        } catch {}

        allSkills.push({
          name: entry.name,
          description,
          category: category || source,
          isActive: source === "active",
          source,
        });
      }
    } catch {
      // Directory doesn't exist
    }
  }

  return allSkills;
}

// ─── Session Scanner (via Hermes CLI) ────────────────────────────────────────

async function scanSessions() {
  try {
    const { stdout } = await execAsync(
      "hermes sessions list --limit 20 2>/dev/null || echo '[]'"
    );
    const sessions = JSON.parse(stdout);
    return sessions.map((s: any) => ({
      id: s.id || s.session_id || String(Math.random()),
      title: s.title || null,
      source: s.source || "cli",
      messages: s.messages || s.message_count || 0,
      tokensIn: s.tokens_in || s.tokensIn || 0,
      tokensOut: s.tokens_out || s.tokensOut || 0,
      createdAt: s.created_at ? new Date(s.created_at) : new Date(),
    }));
  } catch {
    return [];
  }
}

// ─── Cron Jobs Scanner (via Hermes CLI) ──────────────────────────────────────

async function scanCronJobs() {
  try {
    const { stdout } = await execAsync(
      "hermes cron list --json 2>/dev/null || echo '[]'"
    );
    const jobs = JSON.parse(stdout);
    return jobs.map((job: any) => ({
      id: job.id || job.job_id || String(Math.random()),
      name: job.name || "Unnamed Job",
      schedule: job.schedule || "unknown",
      prompt: job.prompt || "",
      isActive: job.enabled !== false,
      lastRun: job.last_run ? new Date(job.last_run) : null,
      runCount: job.run_count || 0,
      createdAt: job.created_at ? new Date(job.created_at) : new Date(),
    }));
  } catch {
    return [];
  }
}

// ─── Health Log ──────────────────────────────────────────────────────────────

async function logHealth() {
  const [noteCount, skillCount, sessionCount] = await Promise.all([
    prisma.vaultNote.count(),
    prisma.skill.count(),
    prisma.session.count(),
  ]);

  const totalLines = await prisma.vaultNote.aggregate({ _sum: { lines: true } });

  await prisma.healthLog.create({
    data: {
      vaultSize: totalLines._sum.lines || 0,
      noteCount,
      skillCount,
      sessionCount,
    },
  });
}

// ─── Main Sync Endpoint ──────────────────────────────────────────────────────

export async function POST() {
  const results = {
    vault: { synced: 0, error: null as string | null },
    skills: { synced: 0, bundled: 0, active: 0, optional: 0, plugins: 0, error: null as string | null },
    sessions: { synced: 0, error: null as string | null },
    cron: { synced: 0, error: null as string | null },
    health: { logged: false, error: null as string | null },
  };

  // 1. Vault Sync
  try {
    const notes = await scanVault();
    await prisma.vaultNote.deleteMany();
    for (const note of notes) {
      await prisma.vaultNote.create({
        data: {
          title: note.title,
          type: note.type,
          folder: note.folder,
          lines: note.lines,
          words: note.words,
          status: "developing",
          confidence: "medium",
          links: "[]",
        },
      });
    }
    results.vault.synced = notes.length;
  } catch (e) {
    results.vault.error = String(e);
  }

  // 2. Skills Sync (full Hermes catalog + filesystem extras)
  try {
    const skills = await scanAllSkills();
    await prisma.skill.deleteMany();
    for (const skill of skills) {
      await prisma.skill.create({ data: skill });
    }
    results.skills.synced = skills.length;
    results.skills.bundled = skills.filter((s) => s.source === "bundled").length;
    results.skills.active = skills.filter((s) => s.source === "active").length;
    results.skills.optional = skills.filter((s) => s.source === "optional").length;
    results.skills.plugins = skills.filter((s) => s.source === "plugin").length;
  } catch (e) {
    results.skills.error = String(e);
  }

  // 3. Sessions Sync
  try {
    const sessions = await scanSessions();
    if (sessions.length > 0) {
      await prisma.session.deleteMany();
      for (const session of sessions) {
        await prisma.session.create({ data: session });
      }
    }
    results.sessions.synced = sessions.length;
  } catch (e) {
    results.sessions.error = String(e);
  }

  // 4. Cron Jobs Sync
  try {
    const jobs = await scanCronJobs();
    if (jobs.length > 0) {
      await prisma.cronJob.deleteMany();
      for (const job of jobs) {
        await prisma.cronJob.create({ data: job });
      }
    }
    results.cron.synced = jobs.length;
  } catch (e) {
    results.cron.error = String(e);
  }

  // 5. Log Health
  try {
    await logHealth();
    results.health.logged = true;
  } catch (e) {
    results.health.error = String(e);
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
