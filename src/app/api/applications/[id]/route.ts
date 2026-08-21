import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import { z } from "zod";

const updateApplicationSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  location: z.string().optional().nullable(),
  jobUrl: z.string().url().optional().or(z.literal("")).nullable(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  applicationDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  status: z.string().optional(),
  stage: z.string().optional(),
  notes: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  recruiterName: z.string().optional().nullable(),
  recruiterEmail: z.string().optional().nullable(),
  recruiterPhone: z.string().optional().nullable(),
  kanbanOrder: z.number().optional(),
  resumeVersionId: z.string().optional().nullable(),
});

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

  const application = await prisma.application.findFirst({
    where: { id, userId },
    include: {
      timelineEvents: {
        orderBy: { occurredAt: "desc" },
      },
      calendarEvents: {
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateApplicationSchema.parse(body);

    const existing = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const timelineEvents: { eventType: string; title: string; description: string }[] = [];
    if (data.stage && data.stage !== existing.stage) {
      timelineEvents.push({
        eventType: "stage_change",
        title: `Moved to ${data.stage}`,
        description: `Stage changed from ${existing.stage} to ${data.stage}`,
      });
    }
    
    if (data.priority && data.priority !== existing.priority) {
      timelineEvents.push({
        eventType: "priority_change",
        title: `Priority changed to ${data.priority}`,
        description: `Priority changed from ${existing.priority} to ${data.priority}`,
      });
    }

    if (data.resumeVersionId !== undefined && data.resumeVersionId !== existing.resumeVersionId) {
      timelineEvents.push({
        eventType: "resume_selected",
        title: data.resumeVersionId ? "Resume Attached" : "Resume Unlinked",
        description: data.resumeVersionId
          ? "A resume version was linked to this application"
          : "Resume was unlinked from this application",
      });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...data,
        applicationDate: data.applicationDate ? new Date(data.applicationDate) : data.applicationDate === null ? null : undefined,
        deadline: data.deadline ? new Date(data.deadline) : data.deadline === null ? null : undefined,
        jobUrl: data.jobUrl === "" ? null : data.jobUrl,
        timelineEvents: timelineEvents.length > 0
          ? { create: timelineEvents }
          : undefined,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  const existing = await prisma.application.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  await prisma.application.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
