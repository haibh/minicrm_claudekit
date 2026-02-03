import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ContactDetailCard } from "@/components/contacts/contact-detail-card";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteContact } from "@/actions/contact-actions";
import { deleteActivity } from "@/actions/activity-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Pencil, Briefcase, Activity, Plus } from "lucide-react";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";

export const dynamic = "force-dynamic";

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  // Parallel fetch: contact with company/tags, recent activities, and deals
  const [contact, activities, deals] = await Promise.all([
    prisma.contact.findUnique({
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
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            deals: true,
            activities: true,
          },
        },
      },
    }),
    prisma.activity.findMany({
      where: {
        contactId: id,
        userId: session.user.id,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.deal.findMany({
      where: {
        contactId: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        value: true,
        stage: true,
        expectedCloseDate: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={contact.name}
        actions={
          <div className="flex gap-2">
            <Link href={`/contacts/${id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <ConfirmDeleteDialog
              itemName={contact.name}
              onConfirm={async () => {
                "use server";
                await deleteContact(id);
              }}
            />
          </div>
        }
      />

      <div className="space-y-6">
        <ContactDetailCard contact={contact} />

        {/* Tabbed navigation: overview, activities, deals */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">
              Activities ({contact._count.activities})
            </TabsTrigger>
            <TabsTrigger value="deals">Deals ({contact._count.deals})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(contact.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(contact.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activities
                </CardTitle>
                <Link
                  href={`/activities/new?contactId=${id}&companyId=${contact.company.id}`}
                >
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Activity
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={activities} onDelete={deleteActivity} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Deals
                </CardTitle>
                <Link
                  href={`/deals/new?companyId=${contact.company.id}&contactId=${id}`}
                >
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Deal
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No deals associated with this contact yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{deal.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(Number(deal.value))}
                              </span>
                              <DealStageBadge stage={deal.stage} />
                            </div>
                            {deal.company && (
                              <p className="text-sm text-gray-500 mt-1">
                                Company: {deal.company.name}
                              </p>
                            )}
                          </div>
                          {deal.expectedCloseDate && (
                            <span className="text-xs text-gray-500">
                              {formatDate(deal.expectedCloseDate)}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
