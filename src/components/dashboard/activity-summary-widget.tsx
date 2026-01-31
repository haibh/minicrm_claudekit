import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon";
import { ActivityType } from "@/generated/prisma/client";
import { ActivitySummary } from "@/lib/dashboard-queries";

interface ActivitySummaryWidgetProps {
  summary: ActivitySummary;
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: "Calls",
  email: "Emails",
  meeting: "Meetings",
  note: "Notes",
};

export function ActivitySummaryWidget({ summary }: ActivitySummaryWidgetProps) {
  const activityTypes: ActivityType[] = ["call", "email", "meeting", "note"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {activityTypes.map((type) => (
            <div
              key={type}
              className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
            >
              <div className="flex-shrink-0 mt-0.5">
                <ActivityTypeIcon type={type} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {ACTIVITY_LABELS[type]}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div>
                    <p className="text-xs text-gray-500">This Week</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {summary.thisWeek[type]}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-300" />
                  <div>
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {summary.thisMonth[type]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
