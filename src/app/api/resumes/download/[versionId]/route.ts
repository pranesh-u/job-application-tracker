import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

async function getUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;
  const demoUser = await getOrCreateDemoUser();
  return demoUser.id;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const userId = await getUserId();
  const { versionId } = await params;

  const version = await prisma.resumeVersion.findUnique({
    where: { id: versionId },
    include: { resume: true },
  });

  if (!version || version.resume.userId !== userId) {
    return NextResponse.json({ error: "Resume version not found" }, { status: 404 });
  }

  try {
    let fileBuffer: Buffer;
    let contentType = "application/octet-stream";
    const extension = version.fileName.split(".").pop()?.toLowerCase();

    if (extension === "pdf") contentType = "application/pdf";
    else if (extension === "docx")
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (extension === "txt") contentType = "text/plain; charset=utf-8";

    if (version.filePath.startsWith("data:")) {
      const base64Data = version.filePath.split(",")[1];
      fileBuffer = Buffer.from(base64Data, "base64");
    } else {
      try {
        const relativePath = version.filePath.replace(/^\//, "");
        const fullPath = path.join(process.cwd(), "public", relativePath);
        fileBuffer = await fs.readFile(fullPath);
      } catch {
        fileBuffer = Buffer.from(version.rawText || "No content available", "utf-8");
      }
    }

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "true";

    const disposition = download
      ? `attachment; filename="${encodeURIComponent(version.fileName)}"`
      : `inline; filename="${encodeURIComponent(version.fileName)}"`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving resume file:", error);
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }
}
