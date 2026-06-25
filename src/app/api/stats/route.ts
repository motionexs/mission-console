import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [notes, skills, sessions, jobs, articles] = await Promise.all([
      prisma.vaultNote.count(),
      prisma.skill.count(),
      prisma.session.count(),
      prisma.cronJob.count(),
      prisma.article.count(),
    ]);

    return NextResponse.json({
      notes, skills, sessions, jobs, articles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
