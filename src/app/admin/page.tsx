import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
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

  const stats = await prisma.application.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    waitlist: 0,
  };

  stats.forEach((stat) => {
    if (stat.status in statusCounts) {
      statusCounts[stat.status as keyof typeof statusCounts] = stat._count;
    }
  });

  const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const recentApplications = await prisma.application.findMany({
    take: 5,
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage applications and events</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-1">Total Applications</p>
          <p className="text-3xl font-bold">{totalApplications}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <p className="text-gray-600 text-sm mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-700">{statusCounts.pending}</p>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <p className="text-gray-600 text-sm mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-700">{statusCounts.approved}</p>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <p className="text-gray-600 text-sm mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-700">{statusCounts.rejected}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Applications</h2>
          <Link
            href="/admin/applications"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No applications yet</p>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((application) => (
              <Link
                key={application.id}
                href={`/admin/applications/${application.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{application.applicantName}</p>
                    <p className="text-sm text-gray-600">{application.user.email}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Event: {application.event.name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : application.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : application.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-bold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Link
            href="/admin/applications"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Review Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
