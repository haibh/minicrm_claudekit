import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CompanyListTable } from "@/components/companies/company-list-table";
import { Plus } from "lucide-react";
import { CompanySize } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

interface CompaniesPageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
    industry?: string;
    size?: string;
  }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const params = await searchParams;
  const query = params.query || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  // Build Prisma where clause — supports search by name, filter by industry/size
  const where = {
    userId: session.user.id,
    ...(query && {
      name: {
        contains: query,
        mode: "insensitive" as const,
      },
    }),
    ...(params.industry && { industry: params.industry }),
    ...(params.size && { size: params.size as CompanySize }),
  };

  // Parallel fetch: paginated companies with relation counts and tags
  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            contacts: true,
            deals: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage your company relationships"
        actions={
          <Link href="/companies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Company
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <SearchInput placeholder="Search companies..." />
      </div>

      <CompanyListTable companies={companies} />

      {totalPages > 1 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
          />
        </div>
      )}
    </div>
  );
}
