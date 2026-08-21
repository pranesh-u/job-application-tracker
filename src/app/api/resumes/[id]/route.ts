import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const INTERVIEW_STAGES = [
  "Online Assessment",
  "Technical Interview",
  "HR Interview",
  "Offer",
  "Accepted",
];

async function getUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;
  const demoUser = await getOrCreateDemoUser();
  return demoUser.id;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        include: {
          applications: {
            select: {
              id: true,
              company: true,
              role: true,
              stage: true,
              applicationDate: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!resume || resume.userId !== userId) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const allLinkedApplications = resume.versions.flatMap((v) => v.applications);
  const usageCount = allLinkedApplications.length;

  const interviewCount = allLinkedApplications.filter((app) =>
    INTERVIEW_STAGES.includes(app.stage)
  ).length;

  const interviewRate =
    usageCount > 0 ? Math.round((interviewCount / usageCount) * 100) : 0;

  const activeVersion =
    resume.versions.find((v) => v.isActive) || resume.versions[0] || null;

  return NextResponse.json({
    ...resume,
    usageCount,
    interviewRate,
    activeVersion,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;
  const body = await req.json();

  const existingResume = await prisma.resume.findUnique({ where: { id } });

  if (!existingResume || existingResume.userId !== userId) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const updatedResume = await prisma.resume.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name.trim() : existingResume.name,
      type: body.type !== undefined ? body.type : existingResume.type,
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  const activeVersion =
    updatedResume.versions.find((v) => v.isActive) ||
    updatedResume.versions[0] ||
    null;

  return NextResponse.json({
    ...updatedResume,
    activeVersion,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: {
      versions: {
        include: {
          applications: true,
        },
      },
    },
  });

  if (!resume || resume.userId !== userId) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Delete physical files for versions not attached to applications
  for (const version of resume.versions) {
    if (version.applications.length === 0 && version.filePath) {
      try {
        const fullPath = path.join(process.cwd(), "public", version.filePath);
        await fs.unlink(fullPath);
      } catch (err) {
        // Ignore file missing errors
      }
    }
  }

  // Delete resume from database (cascade deletes non-linked versions)
  await prisma.resume.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
