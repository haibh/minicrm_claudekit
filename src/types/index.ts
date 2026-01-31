// Re-export Prisma generated types
export type {
  User,
  Session,
  Account,
  Verification,
  Company,
  Contact,
  Deal,
  Activity,
  Tag,
  CompanyTag,
  ContactTag,
} from "@/generated/prisma/client";

// Re-export enums
export {
  DealStage,
  ActivityType,
  AuthorityLevel,
  CompanySize,
} from "@/generated/prisma/client";
