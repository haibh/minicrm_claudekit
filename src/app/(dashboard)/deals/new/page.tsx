import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DealForm } from "@/components/deals/deal-form";

interface NewDealPageProps {
  searchParams: Promise<{ companyId?: string; contactId?: string }>;
}

export default async function NewDealPage({ searchParams }: NewDealPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  const [companies, contacts] = await Promise.all([
    prisma.company.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, industry: true },
      orderBy: { name: "asc" },
    }),
    prisma.contact.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        company: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Deal</h1>
        <p className="text-gray-600 mt-1">Create a new sales opportunity</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <DealForm
          companies={companies}
          contacts={contacts}
          defaultCompanyId={params.companyId}
          defaultContactId={params.contactId}
        />
      </div>
    </div>
  );
}
