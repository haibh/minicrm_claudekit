"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DealStage, Prisma } from "@/generated/prisma/client";

/**
 * Create a new deal linked to a company (and optionally a contact).
 * Validates required fields, verifies ownership, then redirects to detail page.
 */
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

  try {
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
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    if (error instanceof Error && error.message.includes("not found")) throw error;
    throw new Error("Failed to create deal. Please try again.");
  }
}

/**
 * Update an existing deal by ID.
 * Verifies ownership, updates fields, revalidates deal paths.
 */
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

  try {
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
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    if (error instanceof Error && error.message.includes("not found")) throw error;
    throw new Error("Failed to update deal. Please try again.");
  }
}

/**
 * Update only the stage of a deal (used by Kanban drag-drop).
 * Returns success status instead of redirecting.
 */
export async function updateDealStage(id: string, stage: DealStage) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  try {
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
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) throw error;
    throw new Error("Failed to update deal stage. Please try again.");
  }
}

/**
 * Delete a deal by ID. Verifies ownership before deletion.
 */
export async function deleteDeal(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  try {
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
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    if (error instanceof Error && error.message.includes("not found")) throw error;
    throw new Error("Failed to delete deal. Please try again.");
  }
}
