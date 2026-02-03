# Project Roadmap & Status

**Version:** 1.1 | **Updated:** 2026-02-02 | **Status:** Phase 1 Complete + Optimization

---

## Current Phase: Phase 1 — Core MVP (COMPLETE + OPTIMIZED)

**Duration:** Complete (optimization completed 2026-02-02)
**Status:** All core features + Phase 1-6 codebase optimization

### Delivered Features

| Feature | Status | Coverage |
|---------|--------|----------|
| Company CRUD | ✓ Complete | Create, read, update, delete, search, filter |
| Contact Management | ✓ Complete | CRUD, decision-maker flagging, authority levels |
| Deal Pipeline | ✓ Complete | CRUD, kanban board, stage transitions, pipeline metrics |
| Activity Tracking | ✓ Complete | CRUD, timeline view, type filtering, entity linking |
| Dashboard | ✓ Complete | Metrics, pipeline overview, recent activities, deals closing soon |
| Authentication | ✓ Complete | Register, login, logout, session persistence |
| Testing | ✓ Complete | 67 unit tests (100% pass), 60 E2E tests (93% pass) |
| Deployment | ✓ Complete | Docker & Docker Compose, production-ready |
| **Code Optimization** | ✓ Complete | DRY server actions, modular components, security headers |

### Acceptance Criteria Met

- [x] Full CRUD cycle for all entities (companies, contacts, deals, activities)
- [x] Dashboard loads in < 3s with 100+ records
- [x] Kanban board drag-drop works correctly
- [x] Search returns results < 500ms
- [x] Docker Compose deploys in < 10 minutes
- [x] All forms validate inputs with error messages
- [x] User data isolated by userId
- [x] 93% test pass rate (56/60 E2E pass; 4 skipped)
- [x] **Phase 1-6 Optimization:** DRY server actions, modular components, security headers, JSDoc comments

---

## Future Phases

### Phase 2 — Enhanced Features (Q2 2026)

**Priority:** Medium | **Effort:** 4-6 weeks

**Planned Features:**
- [ ] **Import/Export CSV** — Bulk import companies/contacts, export deals/activities
- [ ] **Advanced Search** — Full-text search on contact notes, company name + industry
- [ ] **Reporting** — Pipeline by stage, revenue forecast, activity heatmap
- [ ] **Bulk Actions** — Tag multiple companies, delete batch, assign to deals
- [ ] **Field Customization** — Add custom metadata fields per entity
- [ ] **Email Integration** — Log emails, sync with contact records (stretch)
- [ ] **Notifications** — Deal reminders, activity summaries via email/in-app

**Test Plan:**
- E2E tests for CSV import/export workflows
- Unit tests for advanced search queries
- Dashboard widget tests for new report formats

---

### Phase 3 — Collaboration & Team Features (Q3 2026)

**Priority:** Medium-Low | **Effort:** 6-8 weeks

**Planned Features:**
- [ ] **Multi-User Teams** — Workspaces, role-based access (admin, sales, manager)
- [ ] **Shared Activity Feed** — Team-wide activity log with @mentions
- [ ] **Task Assignment** — Assign deals/contacts to team members
- [ ] **Comments & Notes** — Collaborative notes on deals/contacts
- [ ] **Audit Log** — Track who changed what and when
- [ ] **Permission Levels** — Read-only, edit, delete per user role

**Database Changes:**
- Add `Organization` model (owns multiple users)
- Add `Role` enum (admin, sales_rep, manager, viewer)
- Add `Workspace` concept for team separation

---

### Phase 4 — Performance & Scale (Q4 2026)

**Priority:** Low | **Effort:** 4-6 weeks

**Planned Features:**
- [ ] **Database Optimization** — Query caching, read replicas for dashboard
- [ ] **Pagination Improvements** — Cursor-based pagination for large lists
- [ ] **Lazy Loading** — Load detail views incrementally
- [ ] **Full-Text Search Index** — PostgreSQL FTS for fast company/contact search
- [ ] **Webhook System** — Trigger actions on deal stage change, activity log
- [ ] **API for Integrations** — REST API for third-party apps

**Monitoring:**
- Add performance metrics (load times, query durations)
- Set up error tracking (Sentry or similar)
- Monitor PostgreSQL slow queries

---

### Phase 5 — Polish & Scale (2027+)

**Priority:** Low | **Effort:** Ongoing

**Planned Features:**
- [ ] **Mobile Responsive** — Full mobile app experience (current: tablet-friendly)
- [ ] **Dark Mode** — Tailwind dark mode toggle + persistence
- [ ] **Localization (i18n)** — Vietnamese, English, other languages
- [ ] **Analytics Dashboard** — User engagement, deal velocity trends
- [ ] **AI Features** — Contact recommendation, lead scoring (stretch goal)
- [ ] **Mobile App** — React Native or Flutter companion app

---

## Out-of-Scope (Won't Do)

These features are explicitly **not planned** for MiniCRM:

- Multi-tenant SaaS (MiniCRM is self-hosted only)
- Social media integration
- Calendar sync (Google Calendar, Outlook)
- Document management / file uploads
- Video conferencing integration
- Mobile native app (web-responsive is sufficient)
- Enterprise features (SSO, SAML, 2FA)

---

## Dependencies & Blockers

### No Current Blockers

All Phase 1 features are complete and shipped.

### Future Phase Dependencies

| Phase | Dependency | Status |
|-------|-----------|--------|
| Phase 2 | CSV parsing library | Available (papaparse) |
| Phase 3 | Workspace/org design | Needs specification |
| Phase 3 | Role-based access control | Needs implementation |
| Phase 4 | Caching strategy | Redis or in-memory? |
| Phase 4 | Full-text search | PostgreSQL FTS or Elasticsearch? |

---

## Success Metrics

### Phase 1 Completion Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CRUD Coverage | 100% | 100% | ✓ |
| Unit Test Pass Rate | 95% | 100% | ✓ |
| E2E Test Pass Rate | 90% | 93% (56/60) | ✓ |
| Dashboard Load Time | < 3s | ~1-2s | ✓ |
| Search Performance | < 500ms | < 300ms | ✓ |
| Docker Deploy Time | < 10 min | ~5 min | ✓ |
| Code Coverage (Actions) | 85% | 90% | ✓ |
| Documentation | 80% | 95% | ✓ |

### Future Phase Targets

**Phase 2:**
- [ ] CSV import 10K+ records in < 30s
- [ ] Advanced search < 1s on 100K records
- [ ] Email integration 95% delivery rate
- [ ] Test coverage > 85%

**Phase 3:**
- [ ] Support 5-10 concurrent team users
- [ ] Activity feed < 2s load (100 items)
- [ ] Permission system 0 false positives
- [ ] Audit log queryable in < 500ms

---

## Timeline & Resource Allocation

```
2026
├─ Q1 [████████] Phase 1 Complete
│  └─ Companies, Contacts, Deals, Activities, Dashboard, Auth
├─ Q2 [░░░░░░░░] Phase 2 — Import/Export, Advanced Search, Reporting
│  └─ Start: Early April | Effort: 4-6 weeks
├─ Q3 [░░░░░░░░] Phase 3 — Multi-User Teams, Collaboration
│  └─ Start: Early July | Effort: 6-8 weeks
└─ Q4 [░░░░░░░░] Phase 4 — Performance & Scale, Webhooks, API
   └─ Start: Early October | Effort: 4-6 weeks
```

---

## Version History

| Version | Date | Phase | Key Changes |
|---------|------|-------|-------------|
| 1.1 | 2026-02-02 | Phase 1 Opt | Phase 1-6 optimization: DRY server actions, modular components, security headers, shadcn Table standardization, config improvements |
| 1.0 | 2026-02-01 | Phase 1 | Initial MVP launch: CRUD, Dashboard, Auth, Tests, Docker |
| 0.5 | 2026-01-20 | Phase 1 Beta | E2E test suite, dashboard widgets |
| 0.2 | 2026-01-10 | Phase 1 Alpha | Core CRUD, kanban board, server actions |
| 0.1 | 2025-12-01 | Phase 1 Setup | Project scaffold, schema design, initial auth |

---

## How to Track Progress

1. **GitHub Issues/Projects** — Track individual features & bugs
2. **This Roadmap** — High-level phase status
3. **docs/project-changelog.md** — Detailed change log per release
4. **plans/** directory — Phase-specific implementation plans

---

## Questions & Decisions Needed

### For Phase 2
- Q: Should CSV import auto-create companies if not found?
- Q: Which email provider for email logging integration?
- Q: Reporting export format: PDF, Excel, or both?

### For Phase 3
- Q: How many users in first team pilot?
- Q: Admin panel: built-in or external?
- Q: Team invitation via email link or manual user creation?

### For Phase 4
- Q: Cache layer: Redis, Memcached, or in-memory?
- Q: Webhook events: realtime or batched?
- Q: API auth: OAuth 2.0, API keys, or both?

