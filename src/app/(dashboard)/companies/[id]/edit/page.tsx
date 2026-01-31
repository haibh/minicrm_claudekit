import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/components/companies/company-form";
import { updateCompany } from "@/actions/company-actions";
import { PageHeader } from "@/components/layout/page-header";

interface EditCompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const { id } = await params;

  const company = await prisma.company.findUnique({
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
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Company" description={`Update information for ${company.name}`} />
      <CompanyForm
        company={company}
        action={async (formData: FormData) => {
          "use server";
          await updateCompany(id, formData);
        }}
      />
    </div>
  );
}
