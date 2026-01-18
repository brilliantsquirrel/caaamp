import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { applicationSchema } from "@/lib/validators";

// GET user's applications
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in",
          },
        },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        event: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch applications",
        },
      },
      { status: 500 }
    );
  }
}

// POST new application
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Check if user already applied to this event
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: validatedData.eventId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_APPLICATION",
            message: "You have already applied to this event",
          },
        },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        eventId: validatedData.eventId,
        applicantName: validatedData.applicantName,
        phoneNumber: validatedData.phoneNumber || null,
        emergencyContactName: validatedData.emergencyContactName || null,
        emergencyContactPhone: validatedData.emergencyContactPhone || null,
        dietaryRestrictions: validatedData.dietaryRestrictions || null,
        medicalConditions: validatedData.medicalConditions || null,
        specialRequirements: validatedData.specialRequirements || null,
      },
      include: {
        event: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating application:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid application data",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: "Failed to submit application",
        },
      },
      { status: 500 }
    );
  }
}
