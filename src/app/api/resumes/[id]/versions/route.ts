import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import { extractTextFromBuffer } from "@/lib/resumeParser";
import fs from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];

async function getUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;
  const demoUser = await getOrCreateDemoUser();
  return demoUser.id;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: resumeId } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { versions: true },
  });

  if (!resume || resume.userId !== userId) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

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

    const safeFileName = `${Date.now()}_v${resume.versions.length + 1}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
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

    await prisma.resumeVersion.updateMany({
      where: { resumeId },
      data: { isActive: false },
    });

    const nextVersionNumber =
      resume.versions.reduce((max, v) => Math.max(max, v.versionNumber), 0) + 1;

    const newVersion = await prisma.resumeVersion.create({
      data: {
        resumeId,
        versionNumber: nextVersionNumber,
        filePath: relativeFilePath,
        fileName: file.name,
        fileSize: file.size,
        isActive: true,
        rawText,
      },
    });

    await prisma.resume.update({
      where: { id: resumeId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error("Upload resume version error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume version" },
      { status: 500 }
    );
  }
}
