import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Dashboard layout session:", session ? "HAS SESSION" : "NO SESSION");

  if (!session) {
    redirect("/login");
  }

  const userName = session?.user?.name || "Guest";
  const userEmail = session?.user?.email || "guest@example.com";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed sidebar navigation — visible on all dashboard pages */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">MiniCRM</h1>
        </div>
        <DashboardNav />
      </aside>

      {/* Main content area — offset by sidebar width */}
      <div className="ml-64">
        <DashboardHeader userName={userName} userEmail={userEmail} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
