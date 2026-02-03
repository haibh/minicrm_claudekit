import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { deleteActivity } from "@/actions/activity-actions";
import { ActivityTypeFilter } from "@/components/activities/activity-type-filter";
import { Plus } from "lucide-react";
import { ActivityType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

interface ActivitiesPageProps {
  searchParams: Promise<{
    query?: string;
    type?: ActivityType;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const query = params.query || "";
  const typeFilter = params.type;
  const page = parseInt(params.page || "1", 10);

  // Build Prisma where clause — supports search across subject/description/outcome, filter by type
  const where = {
    userId: session.user.id,
    ...(query && {
      OR: [
        { subject: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
        { outcome: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(typeFilter && { type: typeFilter }),
  };

  // Parallel fetch: paginated activities with related entities
  const [activities, totalCount] = await Promise.all([
    prisma.activity.findMany({
      where,
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
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.activity.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <PageHeader
        title="Activities"
        description={`${totalCount} total activit${totalCount === 1 ? "y" : "ies"}`}
        actions={
          <Link href="/activities/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchInput placeholder="Search activities..." />
          </div>
          <ActivityTypeFilter currentType={typeFilter} />
        </div>

        <ActivityTimeline activities={activities} onDelete={deleteActivity} />

        {totalPages > 1 && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
          />
        )}
      </div>
    </div>
  );
}

