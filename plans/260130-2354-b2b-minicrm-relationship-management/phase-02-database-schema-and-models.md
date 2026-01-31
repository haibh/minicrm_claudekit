# Phase 02: Database Schema & Models

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Data Model](../../docs/product-requirements-pdr.md#4-data-model)
- [Research: PostgreSQL Schema](./research/researcher-02-nextjs-architecture-and-deployment.md)
- Depends on: [Phase 01](./phase-01-project-setup-and-infrastructure.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P1 (Critical Path)
- **Description:** Define complete Prisma schema with all CRM entities, relationships, enums, JSONB metadata fields, indexes. Create seed data script. Run initial migration.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 4h

## Key Insights
- Better Auth requires User, Session, Account tables with specific field names
- JSONB metadata columns enable flexible custom fields without migrations
- GIN indexes on JSONB columns for efficient querying
- Composite unique constraints on join tables (CompanyTag, ContactTag)
- UUID primary keys for all tables (cuid() in Prisma)
- All CRM entities scoped to userId for data isolation

## Requirements

### Functional
- All tables defined in PRD Section 4 implemented in Prisma schema
- Enums: DealStage, ActivityType, AuthorityLevel, CompanySize
- JSONB metadata columns on Company, Contact, Deal, Activity
- Join tables for tag relationships (CompanyTag, ContactTag)
- Seed script with realistic sample data (5 companies, 15 contacts, 10 deals, 20 activities)
- Initial migration generated and applied

### Non-Functional
- All foreign keys have onDelete cascade or setNull as appropriate
- Indexes on frequently queried columns (name, email, stage, date)
- GIN indexes on metadata JSONB columns
- UTF-8 support for Vietnamese characters

## Architecture

### Entity Relationships
```
User (Better Auth managed)
  ├── Company (1:N)
  │     ├── Contact (1:N)
  │     ├── Deal (1:N)
  │     ├── Activity (1:N)
  │     └── CompanyTag (N:M via join)
  ├── Contact
  │     ├── Deal (1:N)
  │     ├── Activity (1:N)
  │     └── ContactTag (N:M via join)
  ├── Deal
  │     └── Activity (1:N)
  ├── Activity
  └── Tag (1:N)
        ├── CompanyTag
        └── ContactTag
```

### Enum Definitions
```
DealStage: prospecting | qualification | proposal | negotiation | closed_won | closed_lost
ActivityType: call | email | meeting | note
AuthorityLevel: primary | secondary | influencer
CompanySize: tiny_1_10 | small_11_50 | medium_51_200 | large_201_500 | enterprise_500_plus
```

## Related Code Files

### Files to Create
- `prisma/schema.prisma` — Full schema with all models, enums, relations, indexes
- `prisma/seed.ts` — Seed script with sample data
- `src/types/index.ts` — Re-export Prisma generated types + custom type helpers

### Files to Modify
- `package.json` — Add prisma seed script, ts-node config
- `tsconfig.json` — Ensure paths work for seed script

## Implementation Steps

1. **Define enums in `prisma/schema.prisma`**
   - DealStage, ActivityType, AuthorityLevel, CompanySize

2. **Define Better Auth tables** (User, Session, Account, Verification)
   - Follow Better Auth's expected field names exactly
   - User: id, name, email, emailVerified, image, createdAt, updatedAt
   - Session: id, expiresAt, token, ipAddress, userAgent, userId
   - Account: id, accountId, providerId, userId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt
   - Verification: id, identifier, value, expiresAt, createdAt, updatedAt

3. **Define Company model**
   - Fields: id, name, industry, size (CompanySize enum), website, phone, email, address, notes, metadata (Json), userId, createdAt, updatedAt
   - Relations: contacts, deals, activities, tags (via CompanyTag)
   - Indexes: name, industry, userId

4. **Define Contact model**
   - Fields: id, name, email, phone, jobTitle, isDecisionMaker, authorityLevel (AuthorityLevel enum), notes, metadata (Json), companyId, userId, createdAt, updatedAt
   - Relations: company, deals, activities, tags (via ContactTag)
   - Indexes: name, email, companyId, userId, isDecisionMaker

5. **Define Deal model**
   - Fields: id, name, value (Decimal), stage (DealStage enum), probability (Int), expectedCloseDate (DateTime), notes, metadata (Json), companyId, contactId, userId, createdAt, updatedAt
   - Relations: company, contact, activities, user
   - Indexes: stage, companyId, contactId, userId, expectedCloseDate

6. **Define Activity model**
   - Fields: id, type (ActivityType enum), subject, description, date (DateTime), durationMinutes (Int), outcome, nextSteps, companyId, contactId, dealId, userId, createdAt, updatedAt
   - Relations: company, contact, deal, user
   - Indexes: type, date, companyId, contactId, dealId, userId

7. **Define Tag model**
   - Fields: id, name, color, userId, createdAt
   - Unique constraint: [name, userId]

8. **Define CompanyTag and ContactTag join tables**
   - Composite PK: [companyId, tagId] and [contactId, tagId]

9. **Create seed script `prisma/seed.ts`**
   - Create 1 test user
   - Create 5 companies with varied industries
   - Create 15 contacts (3 per company, mix of decision-makers)
   - Create 10 deals across different stages
   - Create 20 activities across types
   - Create 5 tags and assign to companies/contacts

10. **Configure seed in `package.json`**
    ```json
    "prisma": { "seed": "npx tsx prisma/seed.ts" }
    ```

11. **Generate and run migration**
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

12. **Verify**: Run `npx prisma studio` to inspect data

## Todo List
- [ ] Define DealStage, ActivityType, AuthorityLevel, CompanySize enums
- [ ] Define User, Session, Account, Verification models (Better Auth)
- [ ] Define Company model with fields, relations, indexes
- [ ] Define Contact model with decision-maker fields
- [ ] Define Deal model with stage and value tracking
- [ ] Define Activity model with type categorization
- [ ] Define Tag model with unique [name, userId] constraint
- [ ] Define CompanyTag and ContactTag join tables
- [ ] Add JSONB metadata fields to Company, Contact, Deal, Activity
- [ ] Add GIN indexes on metadata columns (via raw SQL migration)
- [ ] Create seed script (prisma/seed.ts) with realistic sample data
- [ ] Add prisma seed config to package.json
- [ ] Run initial migration (npx prisma migrate dev --name init)
- [ ] Run seed (npx prisma db seed)
- [ ] Verify all tables and data in Prisma Studio
- [ ] Export and re-export useful types from src/types/index.ts

## Success Criteria
- `npx prisma migrate dev` succeeds without errors
- `npx prisma db seed` populates all tables
- Prisma Studio shows correct relationships
- All foreign keys enforced (cascade delete works)
- Vietnamese characters stored/retrieved correctly in name fields
- Generated Prisma types available in IDE autocomplete

## Risk Assessment
- **Better Auth schema mismatch**: Must match Better Auth's expected field names exactly; refer to Better Auth docs
- **JSONB index via Prisma**: Prisma doesn't natively support GIN indexes; use raw SQL in migration
- **Enum changes require migration**: Keep enums minimal for MVP; use JSONB for truly variable fields
- **Seed data consistency**: Ensure FK references are valid; create parent records before children

## Security Considerations
- All CRM data scoped by userId; enforce in every query
- Seed script should NOT run in production (guard with NODE_ENV check)
- Database credentials never hardcoded; always via env vars
- Password field in Account table stores hashed values only (handled by Better Auth)

## Next Steps
- Phase 03: Build auth pages using the User/Session/Account tables
- Phase 04: Build Company CRUD using Company model
