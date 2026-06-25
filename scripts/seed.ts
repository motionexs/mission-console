import { prisma } from "../src/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

const VAULT_PATH = "/Users/elfredfleischman/Documents/obsidian/Elfred Brain/Elfred Brain";

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

async function walk(dir: string, results: Array<{title:string;type:string;folder:string;lines:number;words:number}>) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
        await walk(fullPath, results);
      }
    } else if (entry.name.endsWith(".md")) {
      const type = getNoteType(entry.name);
      if (type) {
        const content = await fs.readFile(fullPath, "utf-8");
        const lines = content.split("\n").length;
        const words = content.split(/\s+/).filter(Boolean).length;
        results.push({
          title: entry.name.replace(".md", ""),
          type,
          folder: getFolderName(fullPath),
          lines,
          words,
        });
      }
    }
  }
}

async function main() {
  console.log("Scanning vault...");
  const notes: Array<{title:string;type:string;folder:string;lines:number;words:number}> = [];
  await walk(VAULT_PATH, notes);

  console.log(`Found ${notes.length} notes. Clearing old data...`);
  await prisma.vaultNote.deleteMany();

  console.log("Inserting notes...");
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

  // Seed some sample skills
  console.log("Seeding skills...");
  const skillNames = [
    { name: "librarian-agent", description: "Manages Obsidian vault knowledge", category: "note-taking" },
    { name: "obsidian", description: "Read/write/search Obsidian notes", category: "note-taking" },
    { name: "hermes-agent", description: "Configure Hermes Agent", category: "devops" },
    { name: "research-team-sports-science", description: "Sports science research agents", category: "research" },
    { name: "himalaya", description: "IMAP/SMTP email from terminal", category: "email" },
    { name: "github-pr-workflow", description: "GitHub PR lifecycle", category: "github" },
    { name: "test-driven-development", description: "TDD enforcement", category: "software-development" },
    { name: "systematic-debugging", description: "4-phase root cause debugging", category: "software-development" },
    { name: "huggingface-hub", description: "Search/download/upload HF models", category: "mlops" },
    { name: "evaluating-llms-harness", description: "Benchmark LLMs", category: "mlops" },
  ];

  await prisma.skill.deleteMany();
  for (const s of skillNames) {
    await prisma.skill.create({ data: s });
  }

  // Seed sample articles
  console.log("Seeding articles...");
  const articles = [
    { title: "Validation of a Wireless Device-Driven Method of Estimating Caloric Expenditure during Running", authors: "Cronen A et al.", journal: "Appl Physiol Nutr Metab", year: 2026, pmid: "42330544", doi: "10.1139/apnm-2025-0395", url: "https://doi.org/10.1139/apnm-2025-0395" },
    { title: "Basal Energetics and Phosphocreatine Recovery Kinetics in Ambulatory Boys With Duchenne Muscular Dystrophy", authors: "Awale PP et al.", journal: "NMR Biomed", year: 2026, pmid: "42324864", doi: "10.1002/nbm.70336", url: "https://doi.org/10.1002/nbm.70336" },
    { title: "Wearable IMU-based Framework for Daily Physical Activity Recognition and Energy Expenditure Level Classification", authors: "Zhou X et al.", journal: "Front Public Health", year: 2026, pmid: "42293602", doi: "10.3389/fpubh.2026.1829967", url: "https://doi.org/10.3389/fpubh.2026.1829967" },
    { title: "Resting Metabolic Rate and Adaptive Thermogenesis in Physique Athletes", authors: "Tinsley GM et al.", journal: "J Int Soc Sports Nutr", year: 2026, pmid: "42175739", doi: "10.1080/15502783.2026.2676190", url: "https://doi.org/10.1080/15502783.2026.2676190" },
  ];

  await prisma.article.deleteMany();
  for (const a of articles) {
    await prisma.article.create({ data: a });
  }

  console.log("Done! Seeded:", { notes: notes.length, skills: skillNames.length, articles: articles.length });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
