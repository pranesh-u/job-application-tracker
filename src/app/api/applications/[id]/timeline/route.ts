import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTimelineEventSchema = z.object({
  eventType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = createTimelineEventSchema.parse(body);

    // Check ownership
    const application = await prisma.application.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        applicationId: id,
        eventType: data.eventType,
        title: data.title,
        description: data.description,
        metadata: data.metadata,
      },
    });

    return NextResponse.json(timelineEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Create timeline event error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
