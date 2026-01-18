import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: {
      id: params.id,
    },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  let userApplication = null;
  if (session?.user?.id) {
    userApplication = await prisma.application.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: event.id,
        },
      },
    });
  }

  const isPastDeadline =
    event.applicationDeadline && new Date() > event.applicationDeadline;
  const isFull =
    event.maxParticipants && event._count.applications >= event.maxParticipants;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/events"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Events
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-4xl font-bold mb-4">{event.name}</h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6 text-gray-700">
            <div>
              <p className="font-medium text-gray-900 mb-1">Date</p>
              <p>
                {formatDate(event.startDate)}
                {event.endDate && ` - ${formatDate(event.endDate)}`}
              </p>
            </div>

            {event.location && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Location</p>
                <p>{event.location}</p>
              </div>
            )}

            {event.applicationDeadline && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Application Deadline</p>
                <p>{formatDate(event.applicationDeadline)}</p>
              </div>
            )}

            {event.maxParticipants && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Capacity</p>
                <p>
                  {event._count.applications} / {event.maxParticipants} spots filled
                </p>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-6">
              <h2 className="font-bold text-xl mb-2">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="border-t pt-6">
            {!session?.user ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You must be signed in to apply to this event.
                </p>
                <Link
                  href="/login"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                  Sign In to Apply
                </Link>
              </div>
            ) : userApplication ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-2">
                  You have already applied to this event
                </p>
                <p className="text-gray-600 mb-4">
                  Application Status: <span className="font-medium">{userApplication.status}</span>
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block text-blue-600 hover:text-blue-700"
                >
                  View My Applications →
                </Link>
              </div>
            ) : isPastDeadline ? (
              <div className="text-center">
                <p className="text-red-600 font-medium">
                  The application deadline has passed
                </p>
              </div>
            ) : isFull ? (
              <div className="text-center">
                <p className="text-red-600 font-medium">
                  This event is at full capacity
                </p>
              </div>
            ) : !event.isActive ? (
              <div className="text-center">
                <p className="text-red-600 font-medium">
                  This event is no longer accepting applications
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Link
                  href={`/events/${event.id}/apply`}
                  className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 text-lg font-medium"
                >
                  Apply Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
