# Phase 08: Dashboard & Reporting

## Context Links
- [Plan Overview](./plan.md)
- [PRD — Dashboard](../../docs/product-requirements-pdr.md#35-dashboard)
- [Research: Dashboard Design](./research/researcher-01-crm-data-models-and-features.md)
- Depends on: [Phase 04](./phase-04-company-management.md), [Phase 05](./phase-05-contact-management.md), [Phase 06](./phase-06-interaction-and-activity-tracking.md), [Phase 07](./phase-07-deal-pipeline.md)

## Overview
- **Date:** 2026-01-30
- **Priority:** P2
- **Description:** Dashboard home page with key metric cards, pipeline overview, recent activities feed, deals closing soon, and activity summary. Server-rendered widgets using Prisma aggregate queries.
- **Implementation Status:** Pending
- **Review Status:** Not started
- **Effort:** 4h

## Key Insights
- Dashboard is Server Component — all data fetched server-side via Prisma
- Aggregate queries for metrics (count, sum, groupBy)
- No charting library for MVP; use simple stat cards and table widgets
- Pipeline overview: deal count + total value per stage (simple bar or table)
- Activity feed: last 10 activities with type icons
- Deals closing soon: deals with expectedCloseDate within 30 days

## Requirements

### Functional
- Key metrics row: total companies, total contacts, total open deals, total pipeline value
- Pipeline overview: deal count and sum(value) grouped by stage
- Recent activities: last 10 activities with type, subject, linked entity, date
- Deals closing soon: deals with expectedCloseDate <= 30 days, sorted by date
- Activity summary: count of activities this week and this month by type
- Quick action buttons: New Company, New Contact, New Deal, Log Activity

### Non-Functional
- Dashboard loads < 3s with 1000+ records across entities
- All queries scoped by userId
- Server Component (no client-side data fetching)

## Architecture

### Data Fetching
All dashboard data fetched in parallel using Promise.all in the dashboard page Server Component:
```typescript
const [metrics, pipelineData, recentActivities, closingDeals, activitySummary] =
  await Promise.all([
    getKeyMetrics(userId),
    getPipelineOverview(userId),
    getRecentActivities(userId, 10),
    getDealsClosingSoon(userId, 30),
    getActivitySummary(userId),
  ]);
```

### Widget Layout (CSS Grid)
```
┌─────────┬─────────┬─────────┬─────────┐
│Companies│Contacts │Open Deals│Pipeline$│  <- Metric Cards
├─────────┴─────────┴─────────┴─────────┤
│         Pipeline Overview              │  <- Stage breakdown
├────────────────────┬──────────────────┤
│ Recent Activities  │ Deals Closing    │  <- Two-column widgets
│                    │ Soon             │
├────────────────────┴──────────────────┤
│      Activity Summary (by type)       │  <- Weekly/monthly counts
└───────────────────────────────────────┘
```

## Related Code Files

### Files to Create
- `src/lib/dashboard-queries.ts` — Prisma aggregate queries for dashboard data
- `src/components/dashboard/metric-card.tsx` — Single stat card (label, value, icon)
- `src/components/dashboard/metrics-row.tsx` — Row of 4 metric cards
- `src/components/dashboard/pipeline-overview-widget.tsx` — Stage breakdown table/bars
- `src/components/dashboard/recent-activities-widget.tsx` — Activity feed list
- `src/components/dashboard/deals-closing-soon-widget.tsx` — Upcoming deals list
- `src/components/dashboard/activity-summary-widget.tsx` — Activity counts by type
- `src/components/dashboard/quick-actions-bar.tsx` — Action buttons row

### Files to Modify
- `src/app/(dashboard)/page.tsx` — Replace placeholder with real dashboard

## Implementation Steps

1. **Create dashboard queries** `src/lib/dashboard-queries.ts`
   - `getKeyMetrics(userId)` — Prisma count queries for companies, contacts, open deals, sum of pipeline value
   - `getPipelineOverview(userId)` — groupBy stage: count + sum(value) where stage != closed_lost
   - `getRecentActivities(userId, limit)` — Latest activities with contact/company include
   - `getDealsClosingSoon(userId, days)` — Deals where expectedCloseDate <= now+days, stage not closed
   - `getActivitySummary(userId)` — Count activities this week and this month, grouped by type

2. **Build metric card** `src/components/dashboard/metric-card.tsx`
   - Props: label, value, icon, href (optional link)
   - shadcn Card with large value display
   - Lucide icon (Building2, Users, Handshake, DollarSign)

3. **Build metrics row** `src/components/dashboard/metrics-row.tsx`
   - 4-column grid of MetricCards
   - Responsive: 2-col on tablet, 1-col on mobile

4. **Build pipeline overview widget** `src/components/dashboard/pipeline-overview-widget.tsx`
   - Card with title "Pipeline Overview"
   - Table: Stage | Deal Count | Total Value
   - Simple horizontal bar proportional to value (CSS width %)
   - Link each row to deals page filtered by stage

5. **Build recent activities widget** `src/components/dashboard/recent-activities-widget.tsx`
   - Card with title "Recent Activities"
   - List of 10 items: type icon, subject, contact/company link, relative date
   - "View All" link to /activities

6. **Build deals closing soon widget** `src/components/dashboard/deals-closing-soon-widget.tsx`
   - Card with title "Deals Closing Soon"
   - List: deal name, value, company, days until close
   - Color coding: red (< 7 days), orange (< 14), normal (< 30)
   - "View All" link to /deals

7. **Build activity summary widget** `src/components/dashboard/activity-summary-widget.tsx`
   - Card with title "Activity Summary"
   - Grid: type icon + type name + this week count + this month count
   - Rows: Calls, Emails, Meetings, Notes

8. **Build quick actions bar** `src/components/dashboard/quick-actions-bar.tsx`
   - Row of buttons: New Company, New Contact, New Deal, Log Activity
   - Each links to respective /new page

9. **Assemble dashboard page** `src/app/(dashboard)/page.tsx`
   - Server Component
   - Fetch all data via Promise.all
   - Render: QuickActionsBar, MetricsRow, PipelineOverview, two-column (RecentActivities + DealsClosingSoon), ActivitySummary
   - PageHeader: "Dashboard" with welcome message

10. **Test dashboard**
    - Metrics reflect actual data counts
    - Pipeline shows correct grouping
    - Recent activities ordered by date
    - Deals closing soon filtered correctly
    - All links navigate to correct entity pages

## Todo List
- [ ] Create dashboard aggregate queries (src/lib/dashboard-queries.ts)
- [ ] Build metric card component
- [ ] Build metrics row (4 cards: companies, contacts, deals, pipeline value)
- [ ] Build pipeline overview widget (stage table with value bars)
- [ ] Build recent activities widget (last 10 with type icons)
- [ ] Build deals closing soon widget (next 30 days, color-coded)
- [ ] Build activity summary widget (weekly/monthly by type)
- [ ] Build quick actions bar (new company, contact, deal, activity)
- [ ] Assemble dashboard page with grid layout
- [ ] Test: metrics match actual data counts
- [ ] Test: pipeline overview groups deals correctly by stage
- [ ] Test: recent activities ordered newest-first
- [ ] Test: deals closing soon only shows open deals within 30 days
- [ ] Test: dashboard loads < 3s with seeded data
- [ ] Test: all widget links navigate correctly

## Success Criteria
- Dashboard renders all widgets with real data
- Key metrics accurate (verified against DB counts)
- Pipeline overview shows deal distribution by stage
- Recent activities feed shows latest interactions
- Deals closing soon highlights urgent deals
- Page loads < 3s on dev environment
- All links from widgets navigate to correct filtered views

## Risk Assessment
- **Query performance**: Use Promise.all for parallel fetching; add indexes on aggregate columns
- **Empty state**: Handle zero data gracefully (show "No data yet" messages)
- **Value formatting**: Format currency correctly (consider VND symbol or generic number format)
- **Date calculations**: Use consistent UTC date math for "this week" and "this month" boundaries

## Security Considerations
- All dashboard queries scoped by userId
- No aggregate data leaked across users
- Server Component only — no data exposed in client bundle

## Next Steps
- Phase 09: Docker deployment (finalize for production)
