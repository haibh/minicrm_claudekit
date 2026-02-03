# Phase 02: Unit Tests - Utils & Queries

> Parent: [plan.md](./plan.md) | Depends on: [Phase 01](./phase-01-test-infrastructure-setup.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Unit tests for utility functions (src/lib/utils.ts) and dashboard queries (src/lib/dashboard-queries.ts)
- **Test Count:** 18

## Related Files
- `src/lib/utils.ts` — cn, formatCurrency, formatDate, formatDateTime
- `src/lib/dashboard-queries.ts` — getKeyMetrics, getPipelineOverview, getRecentActivities, getDealsClosingSoon, getActivitySummary

---

## Test Cases

### File: `src/__tests__/unit/utils.test.ts` (8 tests)

#### TC-U01: cn() merges class names
- **Input:** cn("px-2", "py-4")
- **Expected:** "px-2 py-4"

#### TC-U02: cn() resolves Tailwind conflicts
- **Input:** cn("px-2", "px-4")
- **Expected:** "px-4" (last wins)

#### TC-U03: cn() handles conditional classes
- **Input:** cn("base", false && "hidden", "visible")
- **Expected:** "base visible"

#### TC-U04: formatCurrency() formats positive values
- **Input:** formatCurrency(1234567)
- **Expected:** "$1,234,567"

#### TC-U05: formatCurrency() formats zero
- **Input:** formatCurrency(0)
- **Expected:** "$0"

#### TC-U06: formatDate() formats Date object
- **Input:** formatDate(new Date("2026-01-15"))
- **Expected:** Contains "Jan" and "2026"

#### TC-U07: formatDate() formats ISO string
- **Input:** formatDate("2026-06-20T00:00:00Z")
- **Expected:** Contains "Jun" and "2026"

#### TC-U08: formatDateTime() includes time
- **Input:** formatDateTime(new Date("2026-03-10T14:30:00"))
- **Expected:** Contains "Mar", "2026", and time portion

---

### File: `src/__tests__/unit/dashboard-queries.test.ts` (10 tests)

> Uses mocked Prisma client

#### TC-DQ01: getKeyMetrics returns correct counts
- **Mock:** company.count→5, contact.count→12, deal.count→3, deal.aggregate→50000
- **Expected:** { companies:5, contacts:12, openDeals:3, pipelineValue:50000 }

#### TC-DQ02: getKeyMetrics filters deals by open stages
- **Verify:** deal.count called with where NOT in [closed_won, closed_lost]

#### TC-DQ03: getKeyMetrics scopes by userId
- **Verify:** All 4 queries include userId filter

#### TC-DQ04: getPipelineOverview groups by stage
- **Mock:** groupBy returns [{stage:"prospecting",_count:{id:2},_sum:{value:1000}}]
- **Expected:** Matching array with stage, count, totalValue

#### TC-DQ05: getPipelineOverview excludes closed deals
- **Verify:** where.stage.notIn includes closed_won, closed_lost

#### TC-DQ06: getRecentActivities returns sorted activities
- **Mock:** activity.findMany returns 3 activities
- **Expected:** Ordered by createdAt desc, includes company/contact names

#### TC-DQ07: getRecentActivities respects limit param
- **Verify:** findMany called with take: limit

#### TC-DQ08: getDealsClosingSoon filters by date range
- **Verify:** where includes expectedCloseDate between now and now+days

#### TC-DQ09: getDealsClosingSoon excludes closed deals
- **Verify:** where.stage.notIn includes closed stages

#### TC-DQ10: getActivitySummary returns week/month breakdown
- **Mock:** activity.findMany returns mixed-type activities
- **Expected:** { thisWeek: {call:X, email:Y...}, thisMonth: {call:X...} }

---

## Todo

- [ ] TC-U01: cn merges class names
- [ ] TC-U02: cn resolves Tailwind conflicts
- [ ] TC-U03: cn handles conditional classes
- [ ] TC-U04: formatCurrency positive values
- [ ] TC-U05: formatCurrency zero
- [ ] TC-U06: formatDate Date object
- [ ] TC-U07: formatDate ISO string
- [ ] TC-U08: formatDateTime includes time
- [ ] TC-DQ01: getKeyMetrics correct counts
- [ ] TC-DQ02: getKeyMetrics filters open stages
- [ ] TC-DQ03: getKeyMetrics scopes by userId
- [ ] TC-DQ04: getPipelineOverview groups by stage
- [ ] TC-DQ05: getPipelineOverview excludes closed
- [ ] TC-DQ06: getRecentActivities sorted
- [ ] TC-DQ07: getRecentActivities respects limit
- [ ] TC-DQ08: getDealsClosingSoon date range
- [ ] TC-DQ09: getDealsClosingSoon excludes closed
- [ ] TC-DQ10: getActivitySummary week/month

## Success Criteria
- All 18 tests pass
- Utils tests run without external dependencies
- Dashboard queries tested with mocked Prisma
