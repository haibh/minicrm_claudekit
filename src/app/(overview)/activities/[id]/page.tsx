import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteActivity } from "@/actions/activity-actions";
import { formatDate } from "@/lib/utils";
import { Pencil, Building2, User, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

interface ActivityDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch activity with related company, contact, and deal data
  const activity = await prisma.activity.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      contact: {
        select: {
          id: true,
          name: true,
          email: true,
          jobTitle: true,
        },
      },
      deal: {
        select: {
          id: true,
          name: true,
          stage: true,
          value: true,
        },
      },
    },
  });

  if (!activity) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={activity.subject}
        actions={
          <div className="flex gap-2">
            <Link href={`/activities/${id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <ConfirmDeleteDialog
              itemName={activity.subject}
              onConfirm={async () => {
                "use server";
                await deleteActivity(id);
              }}
            />
          </div>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ActivityTypeIcon type={activity.type} className="h-6 w-6" />
              Activity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{activity.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(activity.date)}</p>
              </div>
              {activity.durationMinutes && (
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{activity.durationMinutes} minutes</p>
                </div>
              )}
            </div>

            {activity.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
              </div>
            )}

            {activity.outcome && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Outcome</p>
                <p className="text-gray-700">{activity.outcome}</p>
              </div>
            )}

            {activity.nextSteps && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Next Steps</p>
                <p className="text-gray-700 whitespace-pre-wrap">{activity.nextSteps}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Metadata</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{" "}
                  <span className="font-medium">{formatDate(activity.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>{" "}
                  <span className="font-medium">{formatDate(activity.updatedAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related entities card — shows linked company, contact, deal */}
        {(activity.company || activity.contact || activity.deal) && (
          <Card>
            <CardHeader>
              <CardTitle>Related Entities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.company && (
                <Link
                  href={`/companies/${activity.company.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{activity.company.name}</p>
                      {activity.company.industry && (
                        <p className="text-sm text-gray-500">{activity.company.industry}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {activity.contact && (
                <Link
                  href={`/contacts/${activity.contact.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{activity.contact.name}</p>
                      <div className="flex gap-2 text-sm text-gray-500">
                        {activity.contact.jobTitle && <span>{activity.contact.jobTitle}</span>}
                        {activity.contact.email && <span>{activity.contact.email}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {activity.deal && (
                <Link
                  href={`/deals/${activity.deal.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{activity.deal.name}</p>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span className="capitalize">{activity.deal.stage.replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>${activity.deal.value.toString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
