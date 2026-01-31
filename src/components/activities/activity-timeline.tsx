"use client";

import Link from "next/link";
import { ActivityTypeIcon } from "./activity-type-icon";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { formatDate } from "@/lib/utils";
import { Pencil, Building2, User, Briefcase, Trash2 } from "lucide-react";
import { ActivityType } from "@/generated/prisma/client";

interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string | null;
  date: Date;
  durationMinutes: number | null;
  outcome: string | null;
  company?: {
    id: string;
    name: string;
  } | null;
  contact?: {
    id: string;
    name: string;
  } | null;
  deal?: {
    id: string;
    name: string;
  } | null;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onDelete?: (id: string) => Promise<void>;
  showActions?: boolean;
}

export function ActivityTimeline({
  activities,
  onDelete,
  showActions = true,
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No activities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 mt-1">
            <ActivityTypeIcon type={activity.type} className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link
                  href={`/activities/${activity.id}`}
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {activity.subject}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  {formatDate(activity.date)}
                  {activity.durationMinutes && (
                    <span className="ml-2">• {activity.durationMinutes} min</span>
                  )}
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/activities/${activity.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Link>
                  {onDelete && (
                    <ConfirmDeleteDialog
                      itemName={activity.subject}
                      onConfirm={async () => {
                        await onDelete(activity.id);
                      }}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {activity.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {activity.description}
              </p>
            )}

            {activity.outcome && (
              <div className="text-sm mt-2">
                <span className="font-medium text-gray-700">Outcome:</span>{" "}
                <span className="text-gray-600">{activity.outcome}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {activity.company && (
                <Link
                  href={`/companies/${activity.company.id}`}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Building2 className="h-3 w-3" />
                  {activity.company.name}
                </Link>
              )}
              {activity.contact && (
                <Link
                  href={`/contacts/${activity.contact.id}`}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="h-3 w-3" />
                  {activity.contact.name}
                </Link>
              )}
              {activity.deal && (
                <Link
                  href={`/deals/${activity.deal.id}`}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Briefcase className="h-3 w-3" />
                  {activity.deal.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
