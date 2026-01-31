# Product Requirements Document: B2B MiniCRM

**Version:** 1.0 | **Date:** 2026-01-30 | **Status:** Draft

---

## 1. Product Vision & Goals

**Vision:** A lightweight, self-hosted B2B CRM that helps Vietnamese business owners manage relationships with companies and track key decision-makers without enterprise complexity.

**Goals:**
- Centralize business contact and company information
- Track interactions and activities with decision-makers
- Visualize deal pipeline progress
- Provide actionable dashboard insights
- Deploy easily on any VPS via Docker

---

## 2. Target Users & Personas

### Primary: Vietnamese B2B Business Owner
- Manages 50-500 business relationships
- Needs to track who the decision-makers are at each company
- Wants simple, fast UI without training overhead
- Self-hosts on VPS for data sovereignty and cost control

### Secondary: Sales Team Member
- Logs calls, meetings, emails with contacts
- Moves deals through pipeline stages
- Needs personal activity list and upcoming tasks

---

## 3. Core Features (MVP Scope)

### 3.1 Company Management
- CRUD operations for company profiles
- Fields: name, industry, size, website, phone, email, address, tags, notes, metadata (JSONB)
- List view with search, sort, filter by industry/size/tags
- Detail view showing associated contacts, deals, activities
- Tag-based categorization

**User Stories:**
- As a user, I can add a new company with basic info and tags
- As a user, I can search companies by name, industry, or tag
- As a user, I can view all contacts and deals linked to a company
- As a user, I can edit/delete company records

### 3.2 Contact Management (Decision-Maker Tracking)
- CRUD operations for contact profiles
- Fields: name, email, phone, job_title, company_id (FK), is_decision_maker (boolean), authority_level (enum: primary/secondary/influencer), notes, metadata (JSONB)
- Associate contacts with companies (many contacts per company)
- Flag and filter decision-makers
- List view with search, sort, filter by company/role/authority
- Detail view showing interaction timeline, linked deals

**User Stories:**
- As a user, I can add a contact and link them to a company
- As a user, I can mark a contact as a decision-maker with authority level
- As a user, I can filter contacts to show only decision-makers
- As a user, I can see a contact's full interaction history
- As a user, I can search contacts by name, company, or role

### 3.3 Interaction & Activity Tracking
- Log interactions: calls, emails, meetings, notes
- Fields: type (enum), subject, description, contact_id (FK), company_id (FK), deal_id (FK nullable), date, duration_minutes, outcome, next_steps
- Timeline view per contact and per company
- Global activity feed on dashboard
- Filter by type, date range, contact, company

**User Stories:**
- As a user, I can log a call/meeting/email with a contact
- As a user, I can view all interactions for a contact in chronological order
- As a user, I can see recent activities across all contacts on the dashboard
- As a user, I can add follow-up notes to an interaction

### 3.4 Deal Pipeline
- CRUD operations for deals/opportunities
- Fields: name, value (decimal), stage (enum), company_id (FK), contact_id (FK), expected_close_date, probability, notes, metadata (JSONB)
- Stages: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
- Kanban board view with drag-and-drop stage transitions
- List view with sort/filter by stage, value, date
- Deal detail showing linked company, contact, activities

**User Stories:**
- As a user, I can create a deal linked to a company and contact
- As a user, I can drag deals between pipeline stages on a Kanban board
- As a user, I can see total pipeline value per stage
- As a user, I can filter deals by stage, value range, or expected close date

### 3.5 Dashboard
- Pipeline overview: deal count and value per stage
- Recent activities feed (last 10-20)
- Key metrics: total companies, contacts, open deals, total pipeline value
- Deals closing soon (next 30 days)
- Activity summary (interactions this week/month)

**User Stories:**
- As a user, I see a summary dashboard upon login
- As a user, I can see pipeline health at a glance
- As a user, I can see my recent activity and upcoming follow-ups

### 3.6 Search & Filter
- Global search across companies, contacts, deals
- Entity-specific filters (industry, tags, stage, authority level)
- Sort by any column in list views
- Debounced search input for performance

---

## 4. Data Model

### 4.1 Entity Relationship Diagram (Textual)

```
User (1) ---> (N) Company
User (1) ---> (N) Contact
User (1) ---> (N) Deal
User (1) ---> (N) Activity

Company (1) ---> (N) Contact
Company (1) ---> (N) Deal
Company (1) ---> (N) Activity

Contact (1) ---> (N) Deal
Contact (1) ---> (N) Activity

Deal (1) ---> (N) Activity

Tag (N) <---> (N) Company  [via CompanyTag join table]
Tag (N) <---> (N) Contact  [via ContactTag join table]
```

### 4.2 Table Definitions

**User** (managed by Better Auth)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK, auto-generated |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, required |
| emailVerified | BOOLEAN | Better Auth field |
| image | TEXT | Avatar URL |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

**Session** (managed by Better Auth)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| userId | UUID | FK -> User |
| token | TEXT | Session token |
| expiresAt | TIMESTAMP | Expiry |
| ipAddress | VARCHAR(45) | Optional |
| userAgent | TEXT | Optional |

**Account** (managed by Better Auth)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| userId | UUID | FK -> User |
| accountId | TEXT | Provider account ID |
| providerId | TEXT | Provider name |
| accessToken | TEXT | OAuth token |
| refreshToken | TEXT | OAuth refresh |
| expiresAt | TIMESTAMP | Token expiry |
| password | TEXT | Hashed password |

**Company**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | Required |
| industry | VARCHAR(100) | Optional |
| size | VARCHAR(50) | Optional (enum-like: 1-10, 11-50, 51-200, 201-500, 500+) |
| website | VARCHAR(500) | Optional |
| phone | VARCHAR(50) | Optional |
| email | VARCHAR(255) | Optional |
| address | TEXT | Optional |
| notes | TEXT | Optional |
| metadata | JSONB | Custom fields |
| userId | UUID | FK -> User (owner) |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

**Contact**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Optional |
| phone | VARCHAR(50) | Optional |
| jobTitle | VARCHAR(255) | Optional |
| isDecisionMaker | BOOLEAN | Default false |
| authorityLevel | ENUM | primary, secondary, influencer |
| notes | TEXT | Optional |
| metadata | JSONB | Custom fields |
| companyId | UUID | FK -> Company |
| userId | UUID | FK -> User (owner) |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

**Deal**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | Required |
| value | DECIMAL(15,2) | Deal monetary value |
| stage | ENUM | prospecting, qualification, proposal, negotiation, closed_won, closed_lost |
| probability | INT | 0-100 percentage |
| expectedCloseDate | DATE | Optional |
| notes | TEXT | Optional |
| metadata | JSONB | Custom fields |
| companyId | UUID | FK -> Company |
| contactId | UUID | FK -> Contact (nullable) |
| userId | UUID | FK -> User (owner) |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

**Activity**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| type | ENUM | call, email, meeting, note |
| subject | VARCHAR(500) | Required |
| description | TEXT | Optional |
| date | TIMESTAMP | When interaction occurred |
| durationMinutes | INT | Optional |
| outcome | VARCHAR(255) | Optional |
| nextSteps | TEXT | Optional |
| companyId | UUID | FK -> Company (nullable) |
| contactId | UUID | FK -> Contact (nullable) |
| dealId | UUID | FK -> Deal (nullable) |
| userId | UUID | FK -> User (owner) |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

**Tag**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | VARCHAR(100) | Unique per user |
| color | VARCHAR(7) | Hex color code |
| userId | UUID | FK -> User (owner) |
| createdAt | TIMESTAMP | Auto |

**CompanyTag** (join table)
| Field | Type | Notes |
|-------|------|-------|
| companyId | UUID | FK -> Company |
| tagId | UUID | FK -> Tag |

**ContactTag** (join table)
| Field | Type | Notes |
|-------|------|-------|
| contactId | UUID | FK -> Contact |
| tagId | UUID | FK -> Tag |

### 4.3 Indexes
- Company: name, industry, userId
- Contact: name, email, companyId, userId, isDecisionMaker
- Deal: stage, companyId, contactId, userId, expectedCloseDate
- Activity: type, date, companyId, contactId, dealId, userId
- Tag: name + userId (unique composite)
- JSONB: GIN index on metadata columns

---

## 5. Non-Functional Requirements

### Performance
- Page load < 2s on standard VPS (2 CPU, 4GB RAM)
- List views handle 1000+ records with pagination (20 per page)
- Search results < 500ms with debounced input (300ms)
- Dashboard loads in < 3s

### Security
- Password hashing via Better Auth (bcrypt/argon2)
- Session-based auth with HTTP-only cookies
- CSRF protection via Better Auth
- Rate limiting on auth endpoints
- Input sanitization on all forms
- SQL injection prevention via Prisma parameterized queries
- User data isolation (all queries scoped to userId)

### Scalability
- Single-user or small team (1-5 users) for MVP
- PostgreSQL handles 100K+ records per table comfortably
- Stateless Next.js allows horizontal scaling later
- JSONB metadata enables custom fields without schema changes

### Reliability
- Docker health checks on both app and database
- PostgreSQL data persisted via named Docker volumes
- Backup strategy via pg_dump cron
- Graceful error handling with user-friendly messages

---

## 6. UI/UX Specifications

### Layout
- **Sidebar navigation** (collapsible): Dashboard, Companies, Contacts, Deals, Activities
- **Top bar**: Global search, user avatar/menu, notifications area
- **Content area**: Full-width responsive content
- **Responsive**: Desktop-first, functional on tablet

### Views Pattern
- **List views**: Table with sortable columns, pagination, filter sidebar/toolbar, bulk actions
- **Detail views**: Header card with key info, tabbed sections (overview, activities, deals, contacts)
- **Forms**: Modal dialogs for create/edit, inline validation, auto-save drafts (stretch)
- **Kanban**: Drag-and-drop columns for deal pipeline

### Styling
- Tailwind CSS + shadcn/ui component library
- Clean, professional appearance
- Consistent spacing and typography
- Status badges with color coding (deal stages, authority levels)

### Navigation Flow
```
Login -> Dashboard
           |-> Companies -> Company Detail -> Edit Company
           |                    |-> Contacts tab
           |                    |-> Deals tab
           |                    |-> Activities tab
           |-> Contacts -> Contact Detail -> Edit Contact
           |                    |-> Activities tab
           |                    |-> Deals tab
           |-> Deals (Kanban/List) -> Deal Detail -> Edit Deal
           |-> Activities -> Activity List -> Log Activity
```

---

## 7. Authentication & Authorization

### Model
- **Better Auth** with email/password credential provider
- Session stored in database (Session table)
- Protected routes via middleware checking session validity
- All data queries scoped by authenticated userId
- Single role for MVP (no admin/user distinction)

### Auth Pages
- `/login` - Email/password login form
- `/register` - Account creation form
- `/forgot-password` - Password reset (stretch goal)

### Session
- HTTP-only secure cookies
- 30-day session duration (configurable)
- Auto-refresh on activity

---

## 8. Out-of-Scope (MVP)

- Mobile native app
- Email/calendar sync integration
- AI-powered suggestions or lead scoring
- Advanced analytics and forecasting
- Workflow automation and triggers
- Multi-language i18n (prepared for later via UTF-8)
- Dark mode (Tailwind supports it; enable post-MVP)
- Import/export CSV (phase 2)
- File attachments on activities
- Multi-tenant / organization management
- Role-based access control (admin vs user)
- Notifications and reminders system
- API for third-party integrations

---

## 9. Success Metrics

- User can complete full CRUD cycle for companies, contacts, deals, activities
- Dashboard loads in < 3s with 100+ records per entity
- Kanban board drag-and-drop updates deal stage correctly
- Search returns results across entities in < 500ms
- Docker Compose deploys successfully on fresh VPS in < 10 minutes
- All forms validate inputs and show meaningful error messages
- User data is isolated (cannot see other users' data)
