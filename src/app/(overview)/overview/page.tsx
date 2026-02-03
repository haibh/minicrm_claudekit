import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { QuickActionsBar } from "@/components/dashboard/quick-actions-bar";
import { MetricsRow } from "@/components/dashboard/metrics-row";
import { PipelineOverviewWidget } from "@/components/dashboard/pipeline-overview-widget";
import { RecentActivitiesWidget } from "@/components/dashboard/recent-activities-widget";
import { DealsClosingSoonWidget } from "@/components/dashboard/deals-closing-soon-widget";
import { ActivitySummaryWidget } from "@/components/dashboard/activity-summary-widget";
import {
  getKeyMetrics,
  getPipelineOverview,
  getRecentActivities,
  getDealsClosingSoon,
  getActivitySummary,
} from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Session is guaranteed by layout auth check, but TypeScript needs explicit check
  if (!session) {
    throw new Error("Unauthorized - no session");
  }

  const userId = session.user.id;

  const [metrics, pipeline, activities, closingDeals, activitySummary] =
    await Promise.all([
      getKeyMetrics(userId),
      getPipelineOverview(userId),
      getRecentActivities(userId, 10),
      getDealsClosingSoon(userId, 30),
      getActivitySummary(userId),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user.name}! Here&apos;s what&apos;s happening
          with your CRM.
        </p>
      </div>

      <QuickActionsBar />

      <MetricsRow
        companies={metrics.companies}
        contacts={metrics.contacts}
        openDeals={metrics.openDeals}
        pipelineValue={metrics.pipelineValue}
      />

      <PipelineOverviewWidget data={pipeline} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivitiesWidget activities={activities} />
        <DealsClosingSoonWidget deals={closingDeals} />
      </div>

      <ActivitySummaryWidget summary={activitySummary} />
    </div>
  );
}
