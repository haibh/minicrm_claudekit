import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DealDetailCard } from "@/components/deals/deal-detail-card";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteDeal } from "@/actions/deal-actions";
import { Pencil, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
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
        },
      },
      activities: {
        include: {
          company: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true },
          },
          deal: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!deal) {
    notFound();
  }

  // Convert Decimal to number
  const serializedDeal = {
    ...deal,
    value: Number(deal.value),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Details</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/deals/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <ConfirmDeleteDialog
            itemName={deal.name}
            onConfirm={() => deleteDeal(id)}
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            }
          />
        </div>
      </div>

      <DealDetailCard deal={serializedDeal} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({deal.activities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Deal Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Stage:</span>
                <span className="font-medium text-gray-900">
                  {deal.stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Probability:</span>
                <span className="font-medium text-gray-900">{deal.probability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weighted Value:</span>
                <span className="font-medium text-gray-900">
                  ${((Number(deal.value) * deal.probability) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Activity History</h3>
            <Link
              href={`/activities/new?dealId=${id}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Log Activity
            </Link>
          </div>
          <ActivityTimeline activities={deal.activities} showActions={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
