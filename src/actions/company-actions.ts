"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanySize } from "@/generated/prisma/client";
import { parseAndUpsertTags } from "@/lib/tag-utils";

/**
 * Create a new company with optional tags.
 * Validates name, upserts tags, creates company, then redirects to detail page.
 */
export async function createCompany(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  if (!name?.trim()) {
    throw new Error("Company name is required");
  }

  const industry = formData.get("industry") as string | null;
  const size = formData.get("size") as CompanySize | null;
  const website = formData.get("website") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const address = formData.get("address") as string | null;
  const notes = formData.get("notes") as string | null;
  const tagsInput = formData.get("tags") as string | null;

  try {
    const tags = await parseAndUpsertTags(tagsInput, session.user.id);

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        industry: industry?.trim() || null,
        size: size || null,
        website: website?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        userId: session.user.id,
        tags: {
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
    });

    revalidatePath("/companies");
    revalidatePath("/contacts/new");
    revalidatePath("/deals/new");
    revalidatePath("/activities/new");
    redirect(`/companies/${company.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    throw new Error("Failed to create company. Please try again.");
  }
}

/**
 * Update an existing company by ID.
 * Replaces all tags (delete + re-create) and revalidates relevant paths.
 */
export async function updateCompany(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  if (!name?.trim()) {
    throw new Error("Company name is required");
  }

  const industry = formData.get("industry") as string | null;
  const size = formData.get("size") as CompanySize | null;
  const website = formData.get("website") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const address = formData.get("address") as string | null;
  const notes = formData.get("notes") as string | null;
  const tagsInput = formData.get("tags") as string | null;

  try {
    const tags = await parseAndUpsertTags(tagsInput, session.user.id);

    await prisma.company.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name: name.trim(),
        industry: industry?.trim() || null,
        size: size || null,
        website: website?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        tags: {
          deleteMany: {},
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
    });

    revalidatePath(`/companies/${id}`);
    revalidatePath("/companies");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    throw new Error("Failed to update company. Please try again.");
  }
}

/**
 * Delete a company by ID. Only the owning user can delete.
 * Cascading deletes handle related contacts/deals via Prisma schema.
 */
export async function deleteCompany(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  try {
    await prisma.company.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/companies");
    revalidatePath("/contacts");
    revalidatePath("/deals");
    redirect("/companies");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    throw new Error("Failed to delete company. Please try again.");
  }
}
