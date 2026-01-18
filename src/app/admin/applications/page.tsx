import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { eventId?: string; status?: string; search?: string };
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

  // Build filter conditions
  const where: any = {};

  if (searchParams.eventId) {
    where.eventId = searchParams.eventId;
  }

  if (searchParams.status) {
    where.status = searchParams.status;
  }

  if (searchParams.search) {
    where.OR = [
      { applicantName: { contains: searchParams.search, mode: "insensitive" } },
      { user: { email: { contains: searchParams.search, mode: "insensitive" } } },
    ];
  }

  const applications = await prisma.application.findMany({
    where,
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
          startDate: true,
        },
      },
      reviewer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manage Applications</h1>
        <p className="text-gray-600">Review and update application statuses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-bold mb-4">Filters</h2>
        <form className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="eventId" className="block text-sm font-medium mb-2">
              Event
            </label>
            <select
              id="eventId"
              name="eventId"
              defaultValue={searchParams.eventId || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => {
                const form = e.target.form;
                if (form) form.submit();
              }}
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={searchParams.status || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => {
                const form = e.target.form;
                if (form) form.submit();
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-2">
              Search
            </label>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Name or email"
              defaultValue={searchParams.search || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </form>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No applications found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Applicant
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Event
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Submitted
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{application.applicantName}</p>
                        <p className="text-sm text-gray-600">{application.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{application.event.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(application.event.startDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(application.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/applications/${application.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {applications.length} application{applications.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
