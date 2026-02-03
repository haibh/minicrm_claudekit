import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/contacts/contact-form";
import { updateContact } from "@/actions/contact-actions";

export const dynamic = "force-dynamic";

interface EditContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const { id } = await params;

  const [contact, companies] = await Promise.all([
    prisma.contact.findUnique({
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
    }),
    prisma.company.findMany({
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
    }),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Contact" />
      <ContactForm
        contact={contact}
        companies={companies}
        action={async (formData: FormData) => {
          "use server";
          await updateContact(id, formData);
        }}
      />
    </div>
  );
}
