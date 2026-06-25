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
    } catch {}
  }

  await walk(VAULT_PATH);
  return notes;
}

// ─── Skill Health Checker ────────────────────────────────────────────────────

interface SkillHealth {
  name: string;
  status: "healthy" | "missing-files" | "no-skill-md" | "error";
  description: string | null;
  category: string | null;
  hasSkillMd: boolean;
  hasDescription: boolean;
  hasPitfalls: boolean;
  hasVerification: boolean;
  fileCount: number;
  source: string;
  lastModified: Date | null;
  issues: string[];
}

async function checkSkillHealth(
  skillName: string,
  skillDir: string,
  source: string
): Promise<SkillHealth> {
  const issues: string[] = [];
  let hasSkillMd = false;
  let hasDescription = false;
  let hasPitfalls = false;
  let hasVerification = false;
  let description: string | null = null;
  let category: string | null = null;
  let fileCount = 0;
  let lastModified: Date | null = null;

  try {
    const dirExists = await fs.access(skillDir).then(() => true).catch(() => false);
    if (!dirExists) {
      return {
        name: skillName,
        status: "missing-files",
        description: null,
        category: null,
        hasSkillMd: false,
        hasDescription: false,
        hasPitfalls: false,
        hasVerification: false,
        fileCount: 0,
        source,
        lastModified: null,
        issues: ["Skill directory not found"],
      };
    }

    // Count files in skill directory
    const files = await fs.readdir(skillDir, { withFileTypes: true });
    fileCount = files.filter((f) => !f.name.startsWith(".")).length;

    // Get most recent modification time
    let newestMtime = 0;
    for (const file of files) {
      if (file.isFile()) {
        const stat = await fs.stat(path.join(skillDir, file.name));
        if (stat.mtimeMs > newestMtime) newestMtime = stat.mtimeMs;
      }
    }
    lastModified = new Date(newestMtime);

    // Read SKILL.md
    const skillFile = path.join(skillDir, "SKILL.md");
    try {
      const content = await fs.readFile(skillFile, "utf-8");
      hasSkillMd = true;

      // Extract description
      const descMatch = content.match(/^description:\s*["']?([^"'\n]+)["']?/m);
      if (descMatch) {
        description = descMatch[1].trim();
        hasDescription = true;
      } else {
        issues.push("No description in SKILL.md");
      }

      // Extract category
      const catMatch = content.match(/^category:\s*["']?([^"'\n]+)["']?/m);
      if (catMatch) {
        category = catMatch[1].trim();
      }

      // Check for pitfalls section
      hasPitfalls = /##?\s*(pitfalls|gotchas|warnings|known.issues)/i.test(content);
      if (!hasPitfalls) {
        issues.push("No pitfalls section");
      }

      // Check for verification section
      hasVerification = /##?\s*(verification|validate|check|test)/i.test(content);
      if (!hasVerification) {
        issues.push("No verification steps");
      }

      // Check for frontmatter
      if (!content.startsWith("---")) {
        issues.push("Missing YAML frontmatter");
      }
    } catch {
      issues.push("SKILL.md not readable");
    }
  } catch (e) {
    issues.push(`Error: ${String(e)}`);
  }

  // Determine overall status
  let status: SkillHealth["status"] = "healthy";
  if (!hasSkillMd) status = "no-skill-md";
  else if (issues.length > 2) status = "error";

  return {
    name: skillName,
    status,
    description,
    category: category || source,
    hasSkillMd,
    hasDescription,
    hasPitfalls,
    hasVerification,
    fileCount,
    source,
    lastModified,
    issues,
  };
}

async function checkAllSkillsHealth(): Promise<SkillHealth[]> {
  const results: SkillHealth[] = [];

  // Check active skills
  try {
    const activeDir = await fs.readdir(SKILLS_PATH, { withFileTypes: true });
    for (const entry of activeDir) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const health = await checkSkillHealth(entry.name, path.join(SKILLS_PATH, entry.name), "active");
      results.push(health);
    }
  } catch {}

  // Check optional skills
  try {
    const optionalDir = await fs.readdir(OPTIONAL_SKILLS_PATH, { withFileTypes: true });
    for (const entry of optionalDir) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const health = await checkSkillHealth(entry.name, path.join(OPTIONAL_SKILLS_PATH, entry.name), "optional");
      results.push(health);
    }
  } catch {}

  // Check plugins
  try {
    const pluginDir = await fs.readdir(PLUGINS_PATH, { withFileTypes: true });
    for (const entry of pluginDir) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const health = await checkSkillHealth(entry.name, path.join(PLUGINS_PATH, entry.name), "plugin");
      results.push(health);
    }
  } catch {}

  return results;
}

// ─── Hermes CLI Checks ───────────────────────────────────────────────────────

async function checkHermesHealth(): Promise<{
  status: "online" | "offline" | "error";
  version: string | null;
  activeJobs: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let version: string | null = null;
  let activeJobs = 0;

  try {
    // Check if hermes CLI is available
    const { stdout: versionOut } = await execAsync("hermes --version 2>/dev/null || echo 'not-found'");
    version = versionOut.trim() === "not-found" ? null : versionOut.trim();

    // Check cron jobs
    const { stdout: cronOut } = await execAsync("hermes cron list --json 2>/dev/null || echo '[]'");
    const jobs = JSON.parse(cronOut);
    activeJobs = jobs.filter((j: any) => j.enabled !== false).length;
  } catch (e) {
    errors.push(String(e));
  }

  return {
    status: version ? "online" : "offline",
    version,
    activeJobs,
    errors,
  };
}

// ─── Full System Health ──────────────────────────────────────────────────────

export async function GET() {
  try {
    const [skillHealth, hermesHealth, stats] = await Promise.all([
      checkAllSkillsHealth(),
      checkHermesHealth(),
      prisma.vaultNote.aggregate({ _sum: { lines: true } }),
    ]);

    const totalLines = stats._sum.lines || 0;
    const healthySkills = skillHealth.filter((s) => s.status === "healthy").length;
    const unhealthySkills = skillHealth.filter((s) => s.status !== "healthy").length;
    const totalNotes = await prisma.vaultNote.count();
    const totalSkills = skillHealth.length;

    // Overall system health
    const issues: string[] = [];
    if (hermesHealth.status !== "online") issues.push("Hermes CLI not detected");
    if (unhealthySkills > 0) issues.push(`${unhealthySkills} skill(s) have issues`);
    if (totalNotes === 0) issues.push("Vault is empty — run sync");

    return NextResponse.json({
      overall: issues.length === 0 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      summary: {
        totalNotes,
        totalSkills,
        healthySkills,
        unhealthySkills,
        totalLines,
        hermesStatus: hermesHealth.status,
        hermesVersion: hermesHealth.version,
        activeCronJobs: hermesHealth.activeJobs,
      },
      issues,
      skillHealth: skillHealth.sort((a, b) => {
        // Sort: unhealthy first, then by name
        if (a.status === "healthy" && b.status !== "healthy") return 1;
        if (a.status !== "healthy" && b.status === "healthy") return -1;
        return a.name.localeCompare(b.name);
      }),
      hermesHealth,
    });
  } catch (error) {
    return NextResponse.json({
      overall: "error",
      timestamp: new Date().toISOString(),
      error: String(error),
    });
  }
}
