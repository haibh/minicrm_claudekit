import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityForm } from "@/components/activities/activity-form";
import { createActivity } from "@/actions/activity-actions";

export default async function NewActivityPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const [companies, contacts, deals] = await Promise.all([
    prisma.company.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        industry: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.contact.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.deal.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        stage: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Log New Activity" />

      <Card>
        <CardContent className="pt-6">
          <ActivityForm
            action={createActivity}
            companies={companies}
            contacts={contacts}
            deals={deals}
            submitLabel="Create Activity"
          />
        </CardContent>
      </Card>
    </div>
  );
}
