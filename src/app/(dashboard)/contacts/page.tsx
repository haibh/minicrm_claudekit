import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ContactListTable } from "@/components/contacts/contact-list-table";
import { AuthorityLevel } from "@/generated/prisma/client";
import { UserPlus } from "lucide-react";

interface ContactsPageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
    company?: string;
    authorityLevel?: AuthorityLevel;
    decisionMaker?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const params = await searchParams;
  const query = params.query || "";
  const page = parseInt(params.page || "1");
  const companyFilter = params.company;
  const authorityLevelFilter = params.authorityLevel;
  const decisionMakerFilter = params.decisionMaker === "true";

  // Build where clause
  const where = {
    userId: session.user.id,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
        { phone: { contains: query, mode: "insensitive" as const } },
        { jobTitle: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(companyFilter && { companyId: companyFilter }),
    ...(authorityLevelFilter && { authorityLevel: authorityLevelFilter }),
    ...(params.decisionMaker && { isDecisionMaker: decisionMakerFilter }),
  };

  const [contacts, totalCount] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <PageHeader
        title="Contacts"
        actions={
          <Link href="/contacts/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        }
      />

      <div className="space-y-4">
        <SearchInput placeholder="Search contacts by name, email, phone, or job title..." />
        <ContactListTable contacts={contacts} />
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
