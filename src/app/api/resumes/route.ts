import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import { extractTextFromBuffer } from "@/lib/resumeParser";
import fs from "fs/promises";
import path from "path";

const INTERVIEW_STAGES = [
  "Online Assessment",
  "Technical Interview",
  "HR Interview",
  "Offer",
  "Accepted",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];

async function getUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;
  const demoUser = await getOrCreateDemoUser();
  return demoUser.id;
}

export async function GET() {
  const userId = await getUserId();

  const resumes = await prisma.resume.findMany({
    where: { userId },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        include: {
          applications: {
            select: { id: true, stage: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const enrichedResumes = resumes.map((resume) => {
    const allLinkedApplications = resume.versions.flatMap((v) => v.applications);
    const usageCount = allLinkedApplications.length;

    const interviewCount = allLinkedApplications.filter((app) =>
      INTERVIEW_STAGES.includes(app.stage)
    ).length;

    const interviewRate =
      usageCount > 0 ? Math.round((interviewCount / usageCount) * 100) : 0;

    const activeVersion =
      resume.versions.find((v) => v.isActive) || resume.versions[0] || null;

    return {
      id: resume.id,
      userId: resume.userId,
      name: resume.name,
      type: resume.type,
      usageCount,
      interviewRate,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      versions: resume.versions.map((v) => ({
        id: v.id,
        resumeId: v.resumeId,
        versionNumber: v.versionNumber,
        filePath: v.filePath,
        fileName: v.fileName,
        fileSize: v.fileSize,
        isActive: v.isActive,
        uploadedAt: v.uploadedAt,
        profileData: v.profileData,
        rawText: v.rawText,
        analyzedAt: v.analyzedAt,
        applicationCount: v.applications.length,
      })),
      activeVersion: activeVersion
        ? {
            id: activeVersion.id,
            resumeId: activeVersion.resumeId,
            versionNumber: activeVersion.versionNumber,
            filePath: activeVersion.filePath,
            fileName: activeVersion.fileName,
            fileSize: activeVersion.fileSize,
            isActive: activeVersion.isActive,
            uploadedAt: activeVersion.uploadedAt,
            profileData: activeVersion.profileData,
            rawText: activeVersion.rawText,
            analyzedAt: activeVersion.analyzedAt,
          }
        : null,
    };
  });

  return NextResponse.json(enrichedResumes);
}

export async function POST(req: Request) {
  const userId = await getUserId();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || file?.name || "Untitled Resume";
    const type = (formData.get("type") as string) || "General";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Invalid file format. Only PDF, DOCX, and TXT are allowed." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    let relativeFilePath = `/uploads/resumes/${safeFileName}`;

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePathOnDisk = path.join(uploadDir, safeFileName);
      await fs.writeFile(filePathOnDisk, buffer);
    } catch (fsErr) {
      console.warn("Serverless environment: disk write bypassed, storing as Data URL.");
      const mimeType = file.type || "application/octet-stream";
      relativeFilePath = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    const rawText = await extractTextFromBuffer(buffer, file.name);

    const newResume = await prisma.resume.create({
      data: {
        userId,
        name: name.trim(),
        type,
        versions: {
          create: {
            versionNumber: 1,
            filePath: relativeFilePath,
            fileName: file.name,
            fileSize: file.size,
            isActive: true,
            rawText,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    const activeVersion = newResume.versions[0];

    return NextResponse.json(
      {
        ...newResume,
        usageCount: 0,
        interviewRate: 0,
        activeVersion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create resume error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
