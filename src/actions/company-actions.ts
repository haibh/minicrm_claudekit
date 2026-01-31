"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanySize } from "@/generated/prisma/client";

export async function createCompany(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
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

  // Parse tags (comma-separated)
  const tagNames = tagsInput
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];

  // Create or find tags
  const tags = await Promise.all(
    tagNames.map((tagName) =>
      prisma.tag.upsert({
        where: {
          name_userId: {
            name: tagName,
            userId: session.user.id,
          },
        },
        create: {
          name: tagName,
          userId: session.user.id,
        },
        update: {},
      })
    )
  );

  // Create company
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

  redirect(`/companies/${company.id}`);
}

export async function updateCompany(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
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

  // Parse tags
  const tagNames = tagsInput
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];

  // Create or find tags
  const tags = await Promise.all(
    tagNames.map((tagName) =>
      prisma.tag.upsert({
        where: {
          name_userId: {
            name: tagName,
            userId: session.user.id,
          },
        },
        create: {
          name: tagName,
          userId: session.user.id,
        },
        update: {},
      })
    )
  );

  // Update company and sync tags
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
}

export async function deleteCompany(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.company.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  redirect("/companies");
}
