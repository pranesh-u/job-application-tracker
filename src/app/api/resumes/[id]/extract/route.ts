import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import { extractTextFromBuffer } from "@/lib/resumeParser";

async function getUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;
  const demoUser = await getOrCreateDemoUser();
  return demoUser.id;
}

/**
 * POST /api/resumes/[id]/extract
 * Re-extracts text from an existing resume version's stored file.
 * Expects JSON body: { versionId: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: resumeId } = await params;

  try {
    const body = await req.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { error: "versionId is required" },
        { status: 400 }
      );
    }

    // Verify resume belongs to user
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== userId) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Get the version
    const version = await prisma.resumeVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.resumeId !== resumeId) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Extract text from stored Data URL
    let rawText: string | null = null;

    if (version.filePath?.startsWith("data:")) {
      const base64Data = version.filePath.split(",")[1];
      if (base64Data) {
        const buffer = Buffer.from(base64Data, "base64");
        rawText = await extractTextFromBuffer(buffer, version.fileName);
      }
    } else {
      console.warn(`Version ${versionId} filePath is not a data URL: ${version.filePath?.substring(0, 50)}`);
    }

    if (!rawText) {
      const reason = !version.filePath?.startsWith("data:")
        ? "This resume was uploaded before serverless storage was enabled. Please re-upload the file."
        : "PDF text extraction failed. The file may be a scanned image. Try re-uploading a text-based PDF.";
      return NextResponse.json(
        { error: reason },
        { status: 422 }
      );
    }

    // Update the version with extracted text
    await prisma.resumeVersion.update({
      where: { id: versionId },
      data: { rawText },
    });

    return NextResponse.json({ rawText, success: true });
  } catch (error) {
    console.error("Re-extract text error:", error);
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 }
    );
  }
}
