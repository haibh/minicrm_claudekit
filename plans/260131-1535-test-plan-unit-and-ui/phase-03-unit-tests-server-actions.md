# Phase 03: Unit Tests - Server Actions

> Parent: [plan.md](./plan.md) | Depends on: [Phase 01](./phase-01-test-infrastructure-setup.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Unit tests for all 13 server actions across 4 action files
- **Test Count:** 39

## Related Files
- `src/actions/company-actions.ts` — createCompany, updateCompany, deleteCompany
- `src/actions/contact-actions.ts` — createContact, updateContact, deleteContact
- `src/actions/activity-actions.ts` — createActivity, updateActivity, deleteActivity
- `src/actions/deal-actions.ts` — createDeal, updateDeal, updateDealStage, deleteDeal

## Mock Strategy
- Mock `src/lib/prisma` → mocked PrismaClient
- Mock `src/lib/auth` → mocked auth.api.getSession()
- Mock `next/headers` → mocked headers()
- Mock `next/cache` → mocked revalidatePath()
- Mock `next/navigation` → mocked redirect()

---

## Test Cases

### File: `src/__tests__/unit/company-actions.test.ts` (9 tests)

#### TC-CA01: createCompany — creates with valid data
- **Input:** FormData{name:"Acme Corp", industry:"Tech", size:"medium_51_200"}
- **Mock:** Session exists, prisma.company.create returns company
- **Expected:** redirect called with /companies/{id}

#### TC-CA02: createCompany — rejects empty name
- **Input:** FormData{name:""}
- **Expected:** Throws error "Name is required"

#### TC-CA03: createCompany — rejects unauthenticated user
- **Mock:** auth.api.getSession returns null
- **Expected:** Redirects to /login or throws unauthorized

#### TC-CA04: createCompany — creates tags via upsert
- **Input:** FormData{name:"Co", tags:"vip, partner"}
- **Verify:** tag.upsert called 2x, companyTag.create called 2x

#### TC-CA05: createCompany — handles empty tags gracefully
- **Input:** FormData{name:"Co", tags:""}
- **Verify:** No tag.upsert called

#### TC-CA06: updateCompany — updates existing company
- **Input:** id="abc", FormData{name:"Updated Corp"}
- **Mock:** company.findUnique returns owned company
- **Expected:** company.update called, redirect to detail

#### TC-CA07: updateCompany — rejects non-owned company
- **Mock:** company.findUnique returns company with different userId
- **Expected:** Throws "not found" or "unauthorized"

#### TC-CA08: deleteCompany — deletes owned company
- **Input:** id="abc"
- **Mock:** company.findUnique returns owned company
- **Expected:** company.delete called, redirect to /companies

#### TC-CA09: deleteCompany — rejects non-owned company
- **Mock:** company.findUnique returns null
- **Expected:** Throws error

---

### File: `src/__tests__/unit/contact-actions.test.ts` (9 tests)

#### TC-CT01: createContact — creates with valid data
- **Input:** FormData{name:"John", companyId:"c1", email:"j@test.com"}
- **Expected:** contact.create called with correct fields

#### TC-CT02: createContact — rejects missing name
- **Input:** FormData{name:"", companyId:"c1"}
- **Expected:** Throws error

#### TC-CT03: createContact — rejects missing companyId
- **Input:** FormData{name:"John", companyId:""}
- **Expected:** Throws error

#### TC-CT04: createContact — verifies company ownership
- **Mock:** company.findUnique returns company with different userId
- **Expected:** Throws unauthorized

#### TC-CT05: createContact — sets authorityLevel only when isDecisionMaker
- **Input:** FormData{name:"J", companyId:"c1", isDecisionMaker:"true", authorityLevel:"primary"}
- **Expected:** contact.create includes authorityLevel:"primary"

#### TC-CT06: createContact — nullifies authorityLevel when not decision maker
- **Input:** FormData{name:"J", companyId:"c1", isDecisionMaker:"false", authorityLevel:"primary"}
- **Expected:** contact.create has authorityLevel:null

#### TC-CT07: updateContact — updates existing contact
- **Mock:** contact.findUnique returns owned contact
- **Expected:** contact.update called

#### TC-CT08: deleteContact — deletes owned contact
- **Expected:** contact.delete called, redirect to /contacts

#### TC-CT09: deleteContact — rejects non-owned contact
- **Expected:** Throws error

---

### File: `src/__tests__/unit/activity-actions.test.ts` (9 tests)

#### TC-AC01: createActivity — creates with valid data
- **Input:** FormData{type:"call", subject:"Follow up", date:"2026-01-15"}
- **Expected:** activity.create called, date parsed correctly

#### TC-AC02: createActivity — rejects missing type
- **Input:** FormData{type:"", subject:"Test"}
- **Expected:** Throws error

#### TC-AC03: createActivity — rejects missing subject
- **Input:** FormData{type:"call", subject:""}
- **Expected:** Throws error

#### TC-AC04: createActivity — defaults date to now
- **Input:** FormData{type:"call", subject:"Test"} (no date)
- **Expected:** activity.create called with date close to Date.now()

#### TC-AC05: createActivity — converts durationMinutes to int
- **Input:** FormData{type:"call", subject:"T", durationMinutes:"30"}
- **Expected:** activity.create has durationMinutes:30 (number)

#### TC-AC06: createActivity — revalidates related entity paths
- **Input:** FormData with companyId:"c1", contactId:"ct1", dealId:"d1"
- **Verify:** revalidatePath called for companies/c1, contacts/ct1, deals/d1

#### TC-AC07: updateActivity — updates owned activity
- **Mock:** activity.findUnique returns owned activity
- **Expected:** activity.update called

#### TC-AC08: deleteActivity — deletes owned activity
- **Expected:** activity.delete called

#### TC-AC09: deleteActivity — rejects non-owned activity
- **Expected:** Throws error

---

### File: `src/__tests__/unit/deal-actions.test.ts` (12 tests)

#### TC-DA01: createDeal — creates with valid data
- **Input:** FormData{name:"Big Deal", value:"50000", stage:"prospecting", companyId:"c1"}
- **Expected:** deal.create called with Decimal value

#### TC-DA02: createDeal — rejects missing name
- **Input:** FormData{name:"", companyId:"c1"}
- **Expected:** Throws error

#### TC-DA03: createDeal — rejects missing companyId
- **Input:** FormData{name:"Deal", companyId:""}
- **Expected:** Throws error

#### TC-DA04: createDeal — defaults value to 0
- **Input:** FormData{name:"Deal", companyId:"c1"} (no value)
- **Expected:** deal.create has value: Decimal(0)

#### TC-DA05: createDeal — defaults stage to prospecting
- **Input:** FormData{name:"Deal", companyId:"c1"} (no stage)
- **Expected:** deal.create has stage:"prospecting"

#### TC-DA06: createDeal — verifies company ownership
- **Mock:** company.findUnique returns different userId
- **Expected:** Throws unauthorized

#### TC-DA07: createDeal — verifies contact ownership when contactId provided
- **Input:** FormData with contactId:"ct1"
- **Mock:** contact.findUnique returns different userId
- **Expected:** Throws unauthorized

#### TC-DA08: createDeal — parses expectedCloseDate
- **Input:** FormData{..., expectedCloseDate:"2026-06-15"}
- **Expected:** deal.create has Date object for expectedCloseDate

#### TC-DA09: updateDeal — updates owned deal
- **Mock:** deal.findUnique returns owned deal
- **Expected:** deal.update called

#### TC-DA10: updateDealStage — updates stage only
- **Input:** id="d1", stage=DealStage.negotiation
- **Mock:** deal.findUnique returns owned deal
- **Expected:** deal.update with only stage field, returns {success:true}

#### TC-DA11: updateDealStage — rejects non-owned deal
- **Mock:** deal.findUnique returns null
- **Expected:** Throws error

#### TC-DA12: deleteDeal — deletes owned deal
- **Expected:** deal.delete called, redirect to /deals

---

## Todo

- [ ] TC-CA01: createCompany valid data
- [ ] TC-CA02: createCompany empty name
- [ ] TC-CA03: createCompany unauthenticated
- [ ] TC-CA04: createCompany with tags
- [ ] TC-CA05: createCompany empty tags
- [ ] TC-CA06: updateCompany valid
- [ ] TC-CA07: updateCompany non-owned
- [ ] TC-CA08: deleteCompany valid
- [ ] TC-CA09: deleteCompany non-owned
- [ ] TC-CT01: createContact valid data
- [ ] TC-CT02: createContact missing name
- [ ] TC-CT03: createContact missing companyId
- [ ] TC-CT04: createContact company ownership
- [ ] TC-CT05: createContact decision maker authority
- [ ] TC-CT06: createContact non-decision maker nullifies authority
- [ ] TC-CT07: updateContact valid
- [ ] TC-CT08: deleteContact valid
- [ ] TC-CT09: deleteContact non-owned
- [ ] TC-AC01: createActivity valid data
- [ ] TC-AC02: createActivity missing type
- [ ] TC-AC03: createActivity missing subject
- [ ] TC-AC04: createActivity default date
- [ ] TC-AC05: createActivity duration conversion
- [ ] TC-AC06: createActivity revalidates paths
- [ ] TC-AC07: updateActivity valid
- [ ] TC-AC08: deleteActivity valid
- [ ] TC-AC09: deleteActivity non-owned
- [ ] TC-DA01: createDeal valid data
- [ ] TC-DA02: createDeal missing name
- [ ] TC-DA03: createDeal missing companyId
- [ ] TC-DA04: createDeal default value
- [ ] TC-DA05: createDeal default stage
- [ ] TC-DA06: createDeal company ownership
- [ ] TC-DA07: createDeal contact ownership
- [ ] TC-DA08: createDeal expectedCloseDate parsing
- [ ] TC-DA09: updateDeal valid
- [ ] TC-DA10: updateDealStage valid
- [ ] TC-DA11: updateDealStage non-owned
- [ ] TC-DA12: deleteDeal valid

## Success Criteria
- All 39 tests pass
- Auth check tested for every action
- Ownership verification tested for update/delete actions
- Edge cases: empty strings, missing fields, type conversions
