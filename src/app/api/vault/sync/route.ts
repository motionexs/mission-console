import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

async function scanVault() {
  const notes: Array<{
    title: string;
    type: string;
    folder: string;
    lines: number;
    words: number;
  }> = [];

  async function walk(dir: string) {
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
  }

  await walk(VAULT_PATH);
  return notes;
}

export async function POST() {
  try {
    const notes = await scanVault();

    // Clear existing notes
    await prisma.vaultNote.deleteMany();

    // Insert fresh data
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

    return NextResponse.json({
      success: true,
      count: notes.length,
      message: `Synced ${notes.length} vault notes`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
