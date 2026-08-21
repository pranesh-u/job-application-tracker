import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import { analyzeResumeVsJD } from "@/lib/aiAnalyzer";
import { extractTextFromBuffer } from "@/lib/resumeParser";

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
  const { id } = await params;

  try {
    const application = await prisma.application.findFirst({
      where: { id, userId },
      include: {
        resumeVersion: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!application.jobDescription || application.jobDescription.trim().length === 0) {
      return NextResponse.json(
        { error: "Please add a Job Description to run AI Match Analysis." },
        { status: 400 }
      );
    }

    if (!application.resumeVersionId || !application.resumeVersion) {
      return NextResponse.json(
        { error: "Please link a Resume Version to run AI Match Analysis." },
        { status: 400 }
      );
    }

    let resumeText =
      application.resumeVersion.rawText ||
      application.resumeVersion.profileData ||
      "";

    // Auto-repair fallback: If rawText is empty, extract text on-the-fly from stored file Data URL
    if (!resumeText || resumeText.trim().length === 0) {
      if (application.resumeVersion.filePath?.startsWith("data:")) {
        const base64Data = application.resumeVersion.filePath.split(",")[1];
        if (base64Data) {
          const buffer = Buffer.from(base64Data, "base64");
          const extracted = await extractTextFromBuffer(
            buffer,
            application.resumeVersion.fileName
          );
          if (extracted) {
            resumeText = extracted;
            await prisma.resumeVersion.update({
              where: { id: application.resumeVersion.id },
              data: { rawText: extracted },
            });
          }
        }
      }
    }

    const analysisResult = analyzeResumeVsJD(
      resumeText,
      application.jobDescription
    );

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        resumeMatch: analysisResult.resumeMatch,
        atsScore: analysisResult.atsScore,
        readinessScore: analysisResult.readinessScore,
        applicationStrength: analysisResult.applicationStrength,
        analysisData: JSON.stringify(analysisResult),
        timelineEvents: {
          create: {
            eventType: "ai_analysis",
            title: `AI Match Analysis Run (${analysisResult.resumeMatch}% Match)`,
            description: `Evaluated resume v${application.resumeVersion.versionNumber} against ${application.company} JD. Found ${analysisResult.matchedSkills.length} matching skills and ${analysisResult.missingSkills.length} missing keywords.`,
          },
        },
      },
    });

    return NextResponse.json({
      application: updatedApplication,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to run AI Match Analysis." },
      { status: 500 }
    );
  }
}
