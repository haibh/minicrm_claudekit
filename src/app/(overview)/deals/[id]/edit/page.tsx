import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DealForm } from "@/components/deals/deal-form";

export const dynamic = "force-dynamic";

interface EditDealPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const [deal, companies, contacts] = await Promise.all([
    prisma.deal.findFirst({
      where: { id, userId: session.user.id },
    }),
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

  if (!deal) {
    notFound();
  }

  // Convert Decimal to number
  const serializedDeal = {
    ...deal,
    value: Number(deal.value),
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Deal</h1>
        <p className="text-gray-600 mt-1">Update deal information</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <DealForm companies={companies} contacts={contacts} deal={serializedDeal} />
      </div>
    </div>
  );
}
