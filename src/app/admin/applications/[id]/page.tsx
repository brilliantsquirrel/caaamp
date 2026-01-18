import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import StatusUpdateForm from "@/components/applications/StatusUpdateForm";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: {
      id: id,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      event: {
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin/applications"
        className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
      >
        ← Back to Applications
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Application Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h1 className="text-3xl font-bold mb-4">Application Review</h1>

            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-xl mb-2">Applicant Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Name</dt>
                    <dd className="text-gray-900">{application.applicantName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="text-gray-900">{application.user.email}</dd>
                  </div>
                  {application.phoneNumber && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Phone</dt>
                      <dd className="text-gray-900">{application.phoneNumber}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="border-t pt-4">
                <h2 className="font-bold text-xl mb-2">Event Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Event Name</dt>
                    <dd className="text-gray-900">{application.event.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Date</dt>
                    <dd className="text-gray-900">
                      {formatDate(application.event.startDate)}
                      {application.event.endDate &&
                        ` - ${formatDate(application.event.endDate)}`}
                    </dd>
                  </div>
                  {application.event.location && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Location</dt>
                      <dd className="text-gray-900">{application.event.location}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="border-t pt-4">
                <h2 className="font-bold text-xl mb-2">Emergency Contact</h2>
                <dl className="space-y-2">
                  {application.emergencyContactName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Name</dt>
                      <dd className="text-gray-900">{application.emergencyContactName}</dd>
                    </div>
                  )}
                  {application.emergencyContactPhone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Phone</dt>
                      <dd className="text-gray-900">{application.emergencyContactPhone}</dd>
                    </div>
                  )}
                  {!application.emergencyContactName &&
                    !application.emergencyContactPhone && (
                      <p className="text-gray-500 text-sm">No emergency contact provided</p>
                    )}
                </dl>
              </div>

              <div className="border-t pt-4">
                <h2 className="font-bold text-xl mb-2">Additional Information</h2>
                <dl className="space-y-3">
                  {application.dietaryRestrictions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">
                        Dietary Restrictions
                      </dt>
                      <dd className="text-gray-900 whitespace-pre-wrap">
                        {application.dietaryRestrictions}
                      </dd>
                    </div>
                  )}
                  {application.medicalConditions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">
                        Medical Conditions
                      </dt>
                      <dd className="text-gray-900 whitespace-pre-wrap">
                        {application.medicalConditions}
                      </dd>
                    </div>
                  )}
                  {application.specialRequirements && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">
                        Special Requirements
                      </dt>
                      <dd className="text-gray-900 whitespace-pre-wrap">
                        {application.specialRequirements}
                      </dd>
                    </div>
                  )}
                  {!application.dietaryRestrictions &&
                    !application.medicalConditions &&
                    !application.specialRequirements && (
                      <p className="text-gray-500 text-sm">
                        No additional information provided
                      </p>
                    )}
                </dl>
              </div>
            </div>
          </div>

          {/* Review History */}
          {application.reviewedAt && application.reviewer && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="font-bold text-lg mb-2">Review History</h2>
              <p className="text-sm text-gray-600">
                Last reviewed by {application.reviewer.name || application.reviewer.email}{" "}
                on {formatDateTime(application.reviewedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Status Update Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="font-bold text-xl mb-2">Update Status</h2>
            <p className="text-sm text-gray-600 mb-4">
              Submitted on {formatDate(application.submittedAt)}
            </p>

            <StatusUpdateForm
              applicationId={application.id}
              currentStatus={application.status}
              currentNotes={application.adminNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
