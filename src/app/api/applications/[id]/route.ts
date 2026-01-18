import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { applicationSchema } from "@/lib/validators";

// GET single application
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const application = await prisma.application.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only see their own applications
      },
      include: {
        event: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Application not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch application",
        },
      },
      { status: 500 }
    );
  }
}

// PATCH update application
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Application not found",
          },
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = applicationSchema.partial().parse(body);

    const application = await prisma.application.update({
      where: {
        id: params.id,
      },
      data: {
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

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error updating application:", error);

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
          code: "UPDATE_ERROR",
          message: "Failed to update application",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE application
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Application not found",
          },
        },
        { status: 404 }
      );
    }

    await prisma.application.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Application deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "Failed to delete application",
        },
      },
      { status: 500 }
    );
  }
}
