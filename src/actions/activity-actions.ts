"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/generated/prisma/client";

export async function createActivity(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const type = formData.get("type") as ActivityType;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string | null;
  const date = formData.get("date") as string;
  const durationMinutes = formData.get("durationMinutes") as string | null;
  const outcome = formData.get("outcome") as string | null;
  const nextSteps = formData.get("nextSteps") as string | null;
  const companyId = formData.get("companyId") as string | null;
  const contactId = formData.get("contactId") as string | null;
  const dealId = formData.get("dealId") as string | null;

  if (!type || !subject) {
    throw new Error("Type and subject are required");
  }

  const activity = await prisma.activity.create({
    data: {
      type,
      subject,
      description: description || undefined,
      date: date ? new Date(date) : new Date(),
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      outcome: outcome || undefined,
      nextSteps: nextSteps || undefined,
      companyId: companyId || undefined,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
      userId: session.user.id,
    },
  });

  revalidatePath("/activities");
  if (companyId) revalidatePath(`/companies/${companyId}`);
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);

  redirect(`/activities/${activity.id}`);
}

export async function updateActivity(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const existing = await prisma.activity.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Activity not found");
  }

  const type = formData.get("type") as ActivityType;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string | null;
  const date = formData.get("date") as string;
  const durationMinutes = formData.get("durationMinutes") as string | null;
  const outcome = formData.get("outcome") as string | null;
  const nextSteps = formData.get("nextSteps") as string | null;
  const companyId = formData.get("companyId") as string | null;
  const contactId = formData.get("contactId") as string | null;
  const dealId = formData.get("dealId") as string | null;

  if (!type || !subject) {
    throw new Error("Type and subject are required");
  }

  await prisma.activity.update({
    where: { id },
    data: {
      type,
      subject,
      description: description || null,
      date: date ? new Date(date) : new Date(),
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      outcome: outcome || null,
      nextSteps: nextSteps || null,
      companyId: companyId || null,
      contactId: contactId || null,
      dealId: dealId || null,
    },
  });

  revalidatePath("/activities");
  revalidatePath(`/activities/${id}`);
  if (companyId) revalidatePath(`/companies/${companyId}`);
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);

  redirect(`/activities/${id}`);
}

export async function deleteActivity(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  await prisma.activity.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/activities");
  redirect("/activities");
}
