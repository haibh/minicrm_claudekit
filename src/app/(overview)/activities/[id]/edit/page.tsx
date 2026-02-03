import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityForm } from "@/components/activities/activity-form";
import { updateActivity } from "@/actions/activity-actions";

export const dynamic = "force-dynamic";

interface EditActivityPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const [activity, companies, contacts, deals] = await Promise.all([
    prisma.activity.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    }),
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

  if (!activity) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Activity" />

      <Card>
        <CardContent className="pt-6">
          <ActivityForm
            action={updateActivity.bind(null, id)}
            defaultValues={activity}
            companies={companies}
            contacts={contacts}
            deals={deals}
            submitLabel="Update Activity"
          />
        </CardContent>
      </Card>
    </div>
  );
}
