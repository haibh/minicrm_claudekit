---
title: "B2B MiniCRM Relationship Management"
description: "Simple CRM for managing business relationships and key decision-maker contacts"
status: pending
priority: P1
effort: 40h
branch: main
tags: [crm, nextjs, prisma, postgresql, docker, better-auth]
created: 2026-01-30
---

# B2B MiniCRM Implementation Plan

## Tech Stack
Next.js 15 (App Router) | TypeScript | PostgreSQL | Prisma ORM | Better Auth | Tailwind CSS + shadcn/ui | Docker Compose

## Phases

| # | Phase | Effort | Status | Dependencies |
|---|-------|--------|--------|-------------|
| 1 | [Project Setup & Infrastructure](./phase-01-project-setup-and-infrastructure.md) | 4h | Pending | None |
| 2 | [Database Schema & Models](./phase-02-database-schema-and-models.md) | 4h | Pending | Phase 1 |
| 3 | [Authentication & User Management](./phase-03-authentication-and-user-management.md) | 5h | Pending | Phase 1, 2 |
| 4 | [Company Management](./phase-04-company-management.md) | 5h | Pending | Phase 2, 3 |
| 5 | [Contact Management](./phase-05-contact-management.md) | 5h | Pending | Phase 4 |
| 6 | [Interaction & Activity Tracking](./phase-06-interaction-and-activity-tracking.md) | 5h | Pending | Phase 4, 5 |
| 7 | [Deal Pipeline](./phase-07-deal-pipeline.md) | 5h | Pending | Phase 4, 5 |
| 8 | [Dashboard & Reporting](./phase-08-dashboard-and-reporting.md) | 4h | Pending | Phase 4-7 |
| 9 | [Docker Deployment](./phase-09-docker-deployment.md) | 3h | Pending | Phase 1-8 |

## Key Decisions
- Server Components for data fetching; Client Components for interactivity
- Server Actions for mutations (no REST API layer)
- Prisma singleton pattern for DB connections
- Better Auth over NextAuth (TypeScript-first, better Docker support)
- JSONB metadata columns for flexible custom fields
- User data isolation via userId scoping on all queries

## Validation Summary

**Validated:** 2026-01-30
**Questions asked:** 8

### Confirmed Decisions
- **Auth**: Email/password only via Better Auth. No OAuth providers needed for MVP.
- **Multi-user**: Single user only. No role system, no team features.
- **Deal stages**: Default 6 stages (Prospecting → Qualification → Proposal → Negotiation → Closed Won → Closed Lost). Hardcoded, not user-configurable.
- **UI language**: English UI. Vietnamese data content supported via UTF-8.
- **JSONB metadata**: Include JSONB metadata columns on Company/Contact/Deal for future flexibility.
- **Seed data**: Generic English sample data (Acme Corp, John Doe style).
- **Kanban**: Full @dnd-kit drag-and-drop implementation. Industry-standard CRM UX.
- **Global search**: Cross-entity search in header bar (companies + contacts + deals results in dropdown).

### Action Items
- No plan changes required — all decisions align with existing plan.

## References
- [PRD](../../docs/product-requirements-pdr.md)
- [Research: Data Models & Features](./research/researcher-01-crm-data-models-and-features.md)
- [Research: Next.js Architecture](./research/researcher-02-nextjs-architecture-and-deployment.md)
