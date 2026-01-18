import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function EventsPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-gray-600">Browse and apply to camping events</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events available at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold mb-2">{event.name}</h2>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <span className="font-medium">Date:</span> {formatDate(event.startDate)}
                  {event.endDate && ` - ${formatDate(event.endDate)}`}
                </p>

                {event.location && (
                  <p>
                    <span className="font-medium">Location:</span> {event.location}
                  </p>
                )}

                {event.applicationDeadline && (
                  <p>
                    <span className="font-medium">Apply by:</span>{" "}
                    {formatDate(event.applicationDeadline)}
                  </p>
                )}
              </div>

              {event.description && (
                <p className="text-gray-700 line-clamp-3 mb-4">{event.description}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {event._count.applications} application{event._count.applications !== 1 ? "s" : ""}
                </span>
                <span className="text-blue-600 font-medium">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
