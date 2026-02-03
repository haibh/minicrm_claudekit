import { CompanySize, AuthorityLevel } from "@/generated/prisma/client";

/** Full labels for company size — used in detail views */
const companySizeFullLabels: Record<CompanySize, string> = {
  tiny_1_10: "1-10 employees",
  small_11_50: "11-50 employees",
  medium_51_200: "51-200 employees",
  large_201_500: "201-500 employees",
  enterprise_500_plus: "500+ employees",
};

/** Short labels for company size — used in list/table views */
const companySizeShortLabels: Record<CompanySize, string> = {
  tiny_1_10: "1-10",
  small_11_50: "11-50",
  medium_51_200: "51-200",
  large_201_500: "201-500",
  enterprise_500_plus: "500+",
};

/** Human-readable labels for authority levels */
const authorityLevelLabels: Record<AuthorityLevel, string> = {
  primary: "Primary",
  secondary: "Secondary",
  influencer: "Influencer",
};

/**
 * Format company size enum to full human-readable label.
 * Returns null if size is null (caller decides fallback).
 */
export function formatCompanySize(size: CompanySize | null): string | null {
  if (!size) return null;
  return companySizeFullLabels[size] || size;
}

/**
 * Format company size enum to short label for tables/lists.
 * Returns "-" as fallback for null values.
 */
export function formatCompanySizeShort(size: string | null): string {
  if (!size) return "-";
  return companySizeShortLabels[size as CompanySize] || size;
}

/**
 * Format authority level enum to human-readable label.
 * Returns "-" as fallback for null values.
 */
export function formatAuthorityLevel(level: AuthorityLevel | null): string {
  if (!level) return "-";
  return authorityLevelLabels[level] || level;
}
