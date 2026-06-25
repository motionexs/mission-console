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

// ─── Skills Scanner ──────────────────────────────────────────────────────────

async function scanSkills() {
  const skills: Array<{
    name: string;
    description: string | null;
    category: string | null;
    isActive: boolean;
  }> = [];

  try {
    const entries = await fs.readdir(SKILLS_PATH, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;

      const skillFile = path.join(SKILLS_PATH, entry.name, "SKILL.md");
      let description: string | null = null;
      let category: string | null = null;

      try {
        const content = await fs.readFile(skillFile, "utf-8");
        const descMatch = content.match(/^description:\s*["']?([^"'\n]+)["']?/m);
        if (descMatch) {
          description = descMatch[1].trim();
        }
        const catMatch = content.match(/^category:\s*["']?([^"'\n]+)["']?/m);
        if (catMatch) {
          category = catMatch[1].trim();
        }
      } catch {
        // SKILL.md doesn't exist or can't be read
      }

      skills.push({
        name: entry.name,
        description,
        category,
        isActive: true,
      });
    }
  } catch {
    // Skills directory doesn't exist
  }

  return skills;
}

// ─── Session Scanner (via Hermes CLI) ────────────────────────────────────────

async function scanSessions() {
  try {
    // Try to get session info from hermes CLI
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
    // If hermes CLI isn't available, return empty
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
  const [noteCount, skillCount, sessionCount, articleCount] = await Promise.all([
    prisma.vaultNote.count(),
    prisma.skill.count(),
    prisma.session.count(),
    prisma.article.count(),
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
    skills: { synced: 0, error: null as string | null },
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

  // 2. Skills Sync
  try {
    const skills = await scanSkills();
    await prisma.skill.deleteMany();
    for (const skill of skills) {
      await prisma.skill.create({ data: skill });
    }
    results.skills.synced = skills.length;
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
