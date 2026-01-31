"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DealStage, Prisma } from "@/generated/prisma/client";

export async function createDeal(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const value = parseFloat(formData.get("value") as string) || 0;
  const stage = (formData.get("stage") as DealStage) || "prospecting";
  const probability = parseInt(formData.get("probability") as string) || 0;
  const expectedCloseDate = formData.get("expectedCloseDate") as string;
  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;
  const notes = formData.get("notes") as string;

  if (!name || !companyId) {
    throw new Error("Name and company are required");
  }

  // Verify company belongs to user
  const company = await prisma.company.findFirst({
    where: { id: companyId, userId: session.user.id },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  // Verify contact belongs to user if provided
  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: session.user.id },
    });
    if (!contact) {
      throw new Error("Contact not found");
    }
  }

  const deal = await prisma.deal.create({
    data: {
      name,
      value: new Prisma.Decimal(value),
      stage,
      probability,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      notes: notes || null,
      companyId,
      contactId: contactId || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/deals");
  redirect(`/deals/${deal.id}`);
}

export async function updateDeal(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const value = parseFloat(formData.get("value") as string) || 0;
  const stage = (formData.get("stage") as DealStage) || "prospecting";
  const probability = parseInt(formData.get("probability") as string) || 0;
  const expectedCloseDate = formData.get("expectedCloseDate") as string;
  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;
  const notes = formData.get("notes") as string;

  if (!name || !companyId) {
    throw new Error("Name and company are required");
  }

  // Verify deal belongs to user
  const existingDeal = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existingDeal) {
    throw new Error("Deal not found");
  }

  await prisma.deal.update({
    where: { id },
    data: {
      name,
      value: new Prisma.Decimal(value),
      stage,
      probability,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      notes: notes || null,
      companyId,
      contactId: contactId || null,
    },
  });

  revalidatePath("/deals");
  revalidatePath(`/deals/${id}`);
  redirect(`/deals/${id}`);
}

export async function updateDealStage(id: string, stage: DealStage) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Verify deal belongs to user
  const deal = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  await prisma.deal.update({
    where: { id },
    data: { stage },
  });

  revalidatePath("/deals");
  return { success: true };
}

export async function deleteDeal(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  // Verify deal belongs to user
  const deal = await prisma.deal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  await prisma.deal.delete({
    where: { id },
  });

  revalidatePath("/deals");
  redirect("/deals");
}
