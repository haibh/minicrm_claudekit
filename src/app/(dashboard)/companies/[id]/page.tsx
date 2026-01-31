import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyDetailCard } from "@/components/companies/company-detail-card";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteCompany } from "@/actions/company-actions";
import { deleteActivity } from "@/actions/activity-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Pencil, Users, Briefcase, Activity, UserPlus, Plus } from "lucide-react";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";

interface CompanyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const { id } = await params;

  const [company, activities, deals] = await Promise.all([
    prisma.company.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        contacts: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            jobTitle: true,
            isDecisionMaker: true,
            authorityLevel: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            contacts: true,
            deals: true,
            activities: true,
          },
        },
      },
    }),
    prisma.activity.findMany({
      where: {
        companyId: id,
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
        companyId: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        value: true,
        stage: true,
        expectedCloseDate: true,
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={company.name}
        actions={
          <div className="flex gap-2">
            <Link href={`/companies/${id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <ConfirmDeleteDialog
              itemName={company.name}
              onConfirm={async () => {
                "use server";
                await deleteCompany(id);
              }}
            />
          </div>
        }
      />

      <div className="space-y-6">
        <CompanyDetailCard company={company} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">
              Contacts ({company._count.contacts})
            </TabsTrigger>
            <TabsTrigger value="deals">Deals ({company._count.deals})</TabsTrigger>
            <TabsTrigger value="activities">
              Activities ({company._count.activities})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(company.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(company.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contacts
                </CardTitle>
                <Link href={`/contacts/new?companyId=${id}`}>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {company.contacts.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No contacts associated with this company yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {company.contacts.map((contact) => (
                      <Link
                        key={contact.id}
                        href={`/contacts/${contact.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            {contact.jobTitle && (
                              <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                            )}
                            <div className="flex gap-3 mt-1 text-sm text-gray-500">
                              {contact.email && <span>{contact.email}</span>}
                              {contact.phone && <span>{contact.phone}</span>}
                            </div>
                          </div>
                          {contact.isDecisionMaker && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              Decision Maker
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

          <TabsContent value="deals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Deals
                </CardTitle>
                <Link href={`/deals/new?companyId=${id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Deal
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No deals associated with this company yet.
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
                            {deal.contact && (
                              <p className="text-sm text-gray-500 mt-1">
                                Contact: {deal.contact.name}
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

          <TabsContent value="activities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activities
                </CardTitle>
                <Link href={`/activities/new?companyId=${id}`}>
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
        </Tabs>
      </div>
    </div>
  );
}
