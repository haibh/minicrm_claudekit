import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/contacts/contact-form";
import { createContact } from "@/actions/contact-actions";

interface NewContactPageProps {
  searchParams: Promise<{
    companyId?: string;
  }>;
}

export default async function NewContactPage({ searchParams }: NewContactPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const params = await searchParams;
  const defaultCompanyId = params.companyId;

  const companies = await prisma.company.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      industry: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div>
      <PageHeader title="Create Contact" />
      <ContactForm
        companies={companies}
        action={createContact}
        defaultCompanyId={defaultCompanyId}
      />
    </div>
  );
}
