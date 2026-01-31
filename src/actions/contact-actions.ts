"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthorityLevel } from "@/generated/prisma/client";

export async function createContact(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const companyId = formData.get("companyId") as string;

  if (!name?.trim()) {
    throw new Error("Contact name is required");
  }

  if (!companyId?.trim()) {
    throw new Error("Company is required");
  }

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

  // Create contact
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

  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const companyId = formData.get("companyId") as string;

  if (!name?.trim()) {
    throw new Error("Contact name is required");
  }

  if (!companyId?.trim()) {
    throw new Error("Company is required");
  }

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

  // Update contact and sync tags
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
}

export async function deleteContact(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.contact.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  redirect("/contacts");
}
