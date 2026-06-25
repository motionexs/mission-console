import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const VAULT_PATH = "/Users/elfredfleischman/Documents/obsidian/Elfred Brain/Elfred Brain";
const HERMES_HOME = path.join(process.env.HOME || "~", ".hermes");
const SKILLS_PATH = path.join(HERMES_HOME, "skills");
const OPTIONAL_SKILLS_PATH = path.join(HERMES_HOME, "hermes-agent/optional-skills");
const PLUGINS_PATH = path.join(HERMES_HOME, "hermes-agent/plugins");

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
  const notes: Array<{ title: string; type: string; folder: string; lines: number; words: number }> = [];
  async function walk(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith(".") && entry.name !== "node_modules") await walk(fullPath);
        } else if (entry.name.endsWith(".md")) {
          const type = getNoteType(entry.name);
          if (type) {
            const content = await fs.readFile(fullPath, "utf-8");
            notes.push({
              title: entry.name.replace(".md", ""),
              type,
              folder: getFolderName(fullPath),
              lines: content.split("\n").length,
              words: content.split(/\s+/).filter(Boolean).length,
            });
          }
        }
      }
    } catch {}
  }
  await walk(VAULT_PATH);
  return notes;
}

async function main() {
  console.log("[sync] Starting sync...");

  // 1. Vault
  const notes = await scanVault();
  await prisma.vaultNote.deleteMany();
  for (const note of notes) {
    await prisma.vaultNote.create({
      data: { title: note.title, type: note.type, folder: note.folder, lines: note.lines, words: note.words, status: "developing", confidence: "medium", links: "[]" },
    });
  }
  console.log(`[sync] Vault: ${notes.length} notes`);

  // 2. Skills (filesystem scan)
  const skills: Array<{ name: string; description: string | null; category: string | null; isActive: boolean; source: string }> = [];
  const dirs = [
    { path: SKILLS_PATH, source: "active" },
    { path: OPTIONAL_SKILLS_PATH, source: "optional" },
    { path: PLUGINS_PATH, source: "plugin" },
  ];
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
        skills.push({ name: entry.name, description, category: category || source, isActive: source === "active", source });
      }
    } catch {}
  }
  await prisma.skill.deleteMany();
  for (const skill of skills) await prisma.skill.create({ data: skill });
  console.log(`[sync] Skills: ${skills.length}`);

  // 3. Health log
  const totalLines = await prisma.vaultNote.aggregate({ _sum: { lines: true } });
  await prisma.healthLog.create({
    data: { vaultSize: totalLines._sum.lines || 0, noteCount: notes.length, skillCount: skills.length, sessionCount: 0 },
  });

  console.log("[sync] Done!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
