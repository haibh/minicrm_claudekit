import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">MiniCRM</h1>
        </div>
        <nav className="px-4 space-y-1">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Dashboard
          </Link>
          <Link
            href="/companies"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Companies
          </Link>
          <Link
            href="/contacts"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Contacts
          </Link>
          <Link
            href="/deals"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Deals
          </Link>
          <Link
            href="/activities"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Activities
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="ml-64">
        <DashboardHeader user={session.user} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
