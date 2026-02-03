import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DealKanbanBoard } from "@/components/deals/deal-kanban-board";
import { DealListTable } from "@/components/deals/deal-list-table";
import { DealViewToggle } from "@/components/deals/deal-view-toggle";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DealsPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const view = params.view || "kanban";

  // Fetch all deals with company and contact relations for pipeline view
  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Prisma Decimal to number for client-side serialization
  const serializedDeals = deals.map((deal) => ({
    ...deal,
    value: Number(deal.value),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-1">
            Manage your sales pipeline and track opportunities
          </p>
        </div>
        <Link
          href="/deals/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </Link>
      </div>

      <div className="flex justify-end">
        <DealViewToggle />
      </div>

      {view === "kanban" ? (
        <DealKanbanBoard deals={serializedDeals} />
      ) : (
        <DealListTable deals={serializedDeals} />
      )}
    </div>
  );
}
