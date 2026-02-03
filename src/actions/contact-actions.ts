"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthorityLevel } from "@/generated/prisma/client";
import { parseAndUpsertTags } from "@/lib/tag-utils";

/**
 * Create a new contact linked to a company.
 * Validates name/company, verifies company ownership, upserts tags, then redirects.
 */
export async function createContact(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const companyId = formData.get("companyId") as string;

  if (!name?.trim()) {
    throw new Error("Contact name is required");
  }

  if (!companyId?.trim()) {
    throw new Error("Company is required");
  }

  try {
    // Verify company ownership before creating contact
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: session.user.id,
      },
    });

    if (!company) {
      throw new Error("Company not found or unauthorized");
    }

    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const jobTitle = formData.get("jobTitle") as string | null;
    const isDecisionMaker = formData.get("isDecisionMaker") === "true";
    const authorityLevel = formData.get("authorityLevel") as AuthorityLevel | null;
    const notes = formData.get("notes") as string | null;
    const tagsInput = formData.get("tags") as string | null;

    const tags = await parseAndUpsertTags(tagsInput, session.user.id);

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        jobTitle: jobTitle?.trim() || null,
        isDecisionMaker,
        authorityLevel: isDecisionMaker ? authorityLevel : null,
        notes: notes?.trim() || null,
        companyId,
        userId: session.user.id,
        tags: {
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
    });

    revalidatePath("/contacts");
    revalidatePath("/deals/new");
    revalidatePath("/activities/new");
    redirect(`/contacts/${contact.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    if (error instanceof Error && error.message.includes("not found")) throw error;
    throw new Error("Failed to create contact. Please try again.");
  }
}

/**
 * Update an existing contact by ID.
 * Verifies company ownership, replaces tags, and revalidates paths.
 */
export async function updateContact(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const companyId = formData.get("companyId") as string;

  if (!name?.trim()) {
    throw new Error("Contact name is required");
  }

  if (!companyId?.trim()) {
    throw new Error("Company is required");
  }

  try {
    // Verify company ownership
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: session.user.id,
      },
    });

    if (!company) {
      throw new Error("Company not found or unauthorized");
    }

    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const jobTitle = formData.get("jobTitle") as string | null;
    const isDecisionMaker = formData.get("isDecisionMaker") === "true";
    const authorityLevel = formData.get("authorityLevel") as AuthorityLevel | null;
    const notes = formData.get("notes") as string | null;
    const tagsInput = formData.get("tags") as string | null;

    const tags = await parseAndUpsertTags(tagsInput, session.user.id);

    await prisma.contact.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        jobTitle: jobTitle?.trim() || null,
        isDecisionMaker,
        authorityLevel: isDecisionMaker ? authorityLevel : null,
        notes: notes?.trim() || null,
        companyId,
        tags: {
          deleteMany: {},
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
    });

    revalidatePath(`/contacts/${id}`);
    revalidatePath("/contacts");
    redirect(`/contacts/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    if (error instanceof Error && error.message.includes("not found")) throw error;
    throw new Error("Failed to update contact. Please try again.");
  }
}

/**
 * Delete a contact by ID. Only the owning user can delete.
 */
export async function deleteContact(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  try {
    await prisma.contact.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/contacts");
    revalidatePath("/deals");
    redirect("/contacts");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    throw new Error("Failed to delete contact. Please try again.");
  }
}
