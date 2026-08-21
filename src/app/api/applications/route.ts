import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getOrCreateDemoUser } from "@/lib/db";
import { z } from "zod";

const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  applicationDate: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  stage: z.string().default("Wishlist"),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().optional(),
  recruiterPhone: z.string().optional(),
  resumeVersionId: z.string().nullable().optional(),
});

async function getUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;
  const demoUser = await getOrCreateDemoUser();
  return demoUser.id;
}

export async function GET() {
  const userId = await getUserId();

  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: [{ kanbanOrder: "asc" }, { createdAt: "desc" }],
    include: {
      timelineEvents: {
        orderBy: { occurredAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  const userId = await getUserId();

  try {
    const body = await req.json();
    const data = createApplicationSchema.parse(body);

    const maxOrder = await prisma.application.findFirst({
      where: { userId, stage: data.stage },
      orderBy: { kanbanOrder: "desc" },
      select: { kanbanOrder: true },
    });

    const application = await prisma.application.create({
      data: {
        userId,
        company: data.company,
        role: data.role,
        location: data.location || null,
        jobUrl: data.jobUrl || null,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        applicationDate: data.applicationDate ? new Date(data.applicationDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        priority: data.priority,
        stage: data.stage,
        notes: data.notes || null,
        jobDescription: data.jobDescription || null,
        recruiterName: data.recruiterName || null,
        recruiterEmail: data.recruiterEmail || null,
        recruiterPhone: data.recruiterPhone || null,
        resumeVersionId: data.resumeVersionId || null,
        kanbanOrder: (maxOrder?.kanbanOrder ?? -1) + 1,
        timelineEvents: {
          create: {
            eventType: "created",
            title: "Application Created",
            description: `Application for ${data.role} at ${data.company} was created`,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
