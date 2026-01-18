import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch events",
        },
      },
      { status: 500 }
    );
  }
}
