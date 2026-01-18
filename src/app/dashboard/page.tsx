import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
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

  const upcomingEvents = await prisma.event.findMany({
    where: {
      isActive: true,
      startDate: {
        gte: new Date(),
      },
      NOT: {
        applications: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    take: 3,
    orderBy: {
      startDate: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {session.user.name || session.user.email}!
        </h1>
        <p className="text-gray-600">Manage your event applications</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-4">My Applications</h2>

            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't applied to any events yet.</p>
                <Link
                  href="/events"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{application.event.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(application.event.startDate)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Applied on {formatDate(application.submittedAt)}
                    </p>

                    {application.event.location && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {application.event.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Available Events</h2>

            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events available.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium mb-1">{event.name}</h3>
                    <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                  </Link>
                ))}

                <Link
                  href="/events"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
                >
                  View All Events →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-4">
            <h3 className="font-bold mb-2">Quick Stats</h3>
            <div className="space-y-1 text-sm">
              <p>Total Applications: {applications.length}</p>
              <p>
                Pending:{" "}
                {applications.filter((a) => a.status === "pending").length}
              </p>
              <p>
                Approved:{" "}
                {applications.filter((a) => a.status === "approved").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
