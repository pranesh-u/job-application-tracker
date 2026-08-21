import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { versionId } = await params;

  const version = await prisma.resumeVersion.findUnique({
    where: { id: versionId },
    include: { resume: true },
  });

  if (!version || version.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Resume version not found" }, { status: 404 });
  }

  try {
    const relativePath = version.filePath.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);

    const fileBuffer = await fs.readFile(fullPath);
    const extension = version.fileName.split(".").pop()?.toLowerCase();

    let contentType = "application/octet-stream";
    if (extension === "pdf") contentType = "application/pdf";
    else if (extension === "docx")
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (extension === "txt") contentType = "text/plain; charset=utf-8";

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "true";

    const disposition = download
      ? `attachment; filename="${encodeURIComponent(version.fileName)}"`
      : `inline; filename="${encodeURIComponent(version.fileName)}"`;

    return new NextResponse(fileBuffer, {
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
