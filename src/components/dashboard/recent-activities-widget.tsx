import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note";
  subject: string;
  createdAt: Date;
  company: { id: string; name: string } | null;
  contact: { id: string; name: string } | null;
}

interface RecentActivitiesWidgetProps {
  activities: Activity[];
}

export function RecentActivitiesWidget({
  activities,
}: RecentActivitiesWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activities</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/activities">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">No activities recorded yet</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const relatedName = activity.contact
                ? activity.contact.name
                : activity.company
                  ? activity.company.name
                  : "Unknown";

              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <ActivityTypeIcon type={activity.type} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{relatedName}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
