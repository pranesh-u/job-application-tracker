import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      userCount,
      hasDbUrl: !!process.env.DATABASE_URL,
    });
  } catch (error: any) {
    console.error("Health check DB error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "failed",
        errorMessage: error?.message || String(error),
        errorCode: error?.code,
        hasDbUrl: !!process.env.DATABASE_URL,
      },
      { status: 500 }
    );
  }
}
