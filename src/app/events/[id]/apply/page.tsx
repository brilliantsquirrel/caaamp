import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ApplicationForm from "@/components/applications/ApplicationForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
  });

  if (!event) {
    notFound();
  }

  // Check if user already applied
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_eventId: {
        userId: session.user.id,
        eventId: event.id,
      },
    },
  });

  if (existingApplication) {
    redirect(`/events/${event.id}`);
  }

  // Check if event is still accepting applications
  const isPastDeadline =
    event.applicationDeadline && new Date() > event.applicationDeadline;
  const isFull =
    event.maxParticipants &&
    (await prisma.application.count({
      where: { eventId: event.id },
    })) >= event.maxParticipants;

  if (!event.isActive || isPastDeadline || isFull) {
    redirect(`/events/${event.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Apply to {event.name}</h1>
        <p className="text-gray-600 mb-8">
          Fill out the form below to submit your application
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <ApplicationForm
            eventId={event.id}
            eventName={event.name}
            userName={session.user.name}
          />
        </div>
      </div>
    </div>
  );
}
