import { prisma } from "@/lib/prisma";

/**
 * Parse comma-separated tag string into trimmed, non-empty tag names.
 * Used by company and contact server actions to process tag input from forms.
 */
export function parseTagNames(tagsInput: string | null): string[] {
  return (
    tagsInput
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) || []
  );
}

/**
 * Upsert tags for a user — creates new tags or finds existing ones.
 * Returns tag records that can be used in Prisma relation creates.
 */
export async function upsertUserTags(tagNames: string[], userId: string) {
  return Promise.all(
    tagNames.map((tagName) =>
      prisma.tag.upsert({
        where: {
          name_userId: {
            name: tagName,
            userId,
          },
        },
        create: {
          name: tagName,
          userId,
        },
        update: {},
      })
    )
  );
}

/**
 * Parse tags input and upsert in one call.
 * Convenience wrapper combining parseTagNames + upsertUserTags.
 */
export async function parseAndUpsertTags(tagsInput: string | null, userId: string) {
  const tagNames = parseTagNames(tagsInput);
  const tags = await upsertUserTags(tagNames, userId);
  return tags;
}
