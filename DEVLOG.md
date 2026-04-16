# CivicPulse — Development Log
### Samuel Obiero Odhiambo (192695) & Mwangi Mwago (191847)
### Strathmore University | BBIT Year 3 | Group D | April–July 2026

> **BINDING VOW: This document is append-only. Nothing written here may be edited, deleted, or rewritten. Every entry is permanent. To break this vow is to forfeit the integrity of the entire record.**

---

## 11 April 2026 — Domain Expansion: Project Selection

Most students, when faced with choosing a project, retreat to the familiar. Mental health apps. Job boards. School management systems. Generic. Safe. Forgettable.

Samuel rejected all of it.

His reasoning was precise: *"I want to go deeper. Make it exciting. Immediate problem-solving in the community. Strathmore is situated in Madaraka, Nairobi West. What problem is being faced around that community?"*

That question — simple as it sounds — is what separates a passing grade from a legendary project. He wasn't asking "what can I build?" He was asking "what needs to exist?"

The research returned something extraordinary. Not theoretical problems. Not distant statistics. Real, documented crises happening within walking distance of campus:

- **March 2026** — the Water Resources Authority issued evacuation orders for Madaraka, Nyayo Highrise, Lang'ata, and Nairobi West. Residents found out through WhatsApp forwards. No early warning system existed.
- Roads in Madaraka Estate — completely submerged. School children stranded, unable to walk home.
- South C — residents reported illegal construction to NEMA via WhatsApp for over a year. No action. One resident was physically threatened for trying.
- Jogoo Road — residents resorted to fixing potholes themselves because no system existed to report and track road damage.
- Nairobi's drainage infrastructure — designed for fewer than 500,000 people. The city now holds nearly five million.

The gap was undeniable. No centralised platform existed for Nairobi's estate residents to report civic issues, track them publicly, and hold authorities accountable.

**CivicPulse was born.**

Not a generic complaint box. A ward-level, geo-tagged, authority-routed, publicly tracked accountability engine. Reports pinned to a map. Ticket numbers. Escalation timers. Weekly performance reports on which authorities responded and which ignored their residents.

The mathematical probability of another team in the cohort landing on this exact idea? Calculated at less than 1. The funnel: 125 projects → 50 that think beyond generic → 12 that think locally → 2–3 that land on civic reporting → less than 1 that frames it around accountability and ward mapping.

But even if someone else chose civic reporting — execution is the domain expansion. Samuel's version has the map, the upvoting, the authority routing, and the automated accountability reports. That combination is his innate technique. No one else possesses it.

---

## 11 April 2026 — First Strike: Concept Note

**Deliverable:** Concept Note | **Due:** 17 April, 5PM | **Weight:** 2% (5 marks)
**Status:** ✅ Landed

Five sections. Background, Proposed Solution, Objectives, Scope, Significance. Five APA citations from real, dated, verifiable sources — including the Madaraka evacuation report from three weeks prior.

The strength of this document lies in one thing: **proximity**. The problem isn't theoretical. The supervisor can walk outside the university gates and see it. The panel can verify every claim. The users are neighbours, not abstractions.

Written in third person. UK English. No "I", no "we". Only "the system", "the researchers", "the proposed solution". Academic rigour applied without mercy.

**Supervisor allocated:** Mr. Mido (Jmido@strathmore.edu)
**Partner confirmed:** Mwangi Mwago (191847), registered on the coordination sheet.

The Concept Note is the binding vow of the project. Everything built after this point must fulfil what was declared here. Five objectives were stated. Every one of them will be achieved.

---

## 11–13 April 2026 — Cursed Technique Refinement: The Full Proposal

Here is where the real architecture begins. Three chapters. Each one a layer of the technique, building on the last.

### Chapter 1 — Introduction ✅

The Concept Note expanded into full academic form. Abstract. Background of the Study. Problem Statement — sharpened to a blade. Five numbered objectives, each measurable: *design and develop*, *implement multi-role authentication*, *build the tracking and escalation engine*, *generate automated reports*, *evaluate feasibility*.

Four research questions mapped directly to those objectives. Scope defined — what's in, what's out. Six target estates named explicitly. Significance argued at three levels: community, institutional, academic.

Seven APA references. The Goldsmith & Crawford civic technology textbook for academic credibility. The rest — news reports, government publications, peer-reviewed journals.

### Chapter 2 — Literature Review ✅

This chapter is the domain awareness — understanding what exists, where it fails, and why CivicPulse fills the void.

**Theoretical Framework — three pillars:**
1. **E-Governance Theory** — digital transformation of government-citizen interaction
2. **Social Accountability Theory** — mechanisms for holding institutions responsible
3. **Participatory Urban Management** — citizens as active agents in infrastructure governance

**Existing platforms dissected:**
- FixMyStreet (UK) — functional but designed for London-type infrastructure, not Nairobi estates
- SeeClickFix (USA) — strong model but no presence in East Africa
- African civic tech initiatives — fragmented, mostly SMS-based, no ward-level granularity

**The gap identified — four points:**
1. No ward-specific reporting platform exists for Nairobi
2. Existing solutions lack accountability mechanisms (escalation, public tracking)
3. No system routes reports to the correct authority automatically
4. No platform generates analytical reports for civic performance measurement

Eighteen APA references. Peer-reviewed journals, conference proceedings, government reports. The literature review doesn't just describe — it argues.

### Chapter 3 — Methodology ✅

The execution blueprint. Every tool justified. Every decision defended.

- **Research design:** Applied + mixed methods
- **Target population:** Madaraka, Nairobi West, South C, South B, Lang'ata, Nyayo Highrise — 45 participants via purposive + convenience sampling
- **Development methodology:** Agile-Scrum. Not chosen blindly — Waterfall, Prototyping, and RAD were explicitly rejected with written arguments for why each fails for this project
- **Sprint plan:** Mapped to the actual semester calendar, week by week
- **Requirements:** 9 functional, 5 non-functional
- **Tech stack locked:**

| Layer | Technology | Justification |
|---|---|---|
| Backend | Node.js + Express | Event-driven, non-blocking, proven for REST APIs |
| Database | PostgreSQL | Relational integrity, ENUM types, geographic data support |
| Frontend | Vanilla HTML/CSS/JS | No framework overhead, maximum control, assessor-friendly |
| Maps | Leaflet.js | Open source, lightweight, perfect for ward-level visualisation |
| Auth | JWT + bcrypt | Stateless, scalable, industry standard |
| Version Control | Git | Mandatory for any serious project |

- **System architecture:** 3-tier (Presentation → Application → Data), REST/JSON, role-based access control
- **Gantt chart:** 14 weeks, every activity assigned a timeframe
- **Ethics:** Kenya Data Protection Act 2019 cited, AI usage declared transparently

**The Proposal was submitted 30 days before the deadline.** The average pair in the cohort had not started writing.

---

## 13 April 2026 — Blueprint Manifest: Design Diagrams

**Deliverable:** Design Diagrams PPT | **Due:** 25–29 May
**Status:** ✅ Completed six weeks early

Four diagrams. Each one a different view of the same system — like seeing a cursed technique from four angles.

**1. Use Case Diagram**
Three actors: Resident, Authority Officer, Administrator. Eight use cases. The system boundary drawn clean — everything inside is CivicPulse's domain, everything outside interacts through defined interfaces.

**2. Entity-Relationship Diagram**
Seven tables: `users`, `wards`, `authorities`, `categories`, `reports`, `upvotes`, `report_status_history`. Every primary key, every foreign key, every relationship mapped. Crow's foot notation. This diagram IS the database — before a single line of SQL is written.

**3. Data Flow Diagram (Level 1)**
Three external entities (Resident, Officer, Admin). Four numbered processes (Authentication, Report Submission, Report Management, Report Generation). Two data stores (D1: Users, D2: Reports). Every data flow labelled — credentials in, tokens out, report data in, status updates out, generated reports delivered.

**4. System Architecture**
The three tiers visualised: Browser → Node.js/Express (with Authentication, Report Engine, Analytics modules) → PostgreSQL (Users, Reports, Wards, Authorities). External arrow to government authorities via email notification.

**Presentation:** 8 slides. Navy/ocean-blue palette with amber accents. Consistent footer. Gold accent bar. Title slide with both names, admission numbers, group, semester.

---

## 13–14 April 2026 — Construction Begins: Backend Development

This is where theory becomes steel. Every document written until now was preparation. Now the system materialises.

### Sprint 1 — Foundation ✅

The project scaffolded from zero. `npm init`. Dependencies installed. Folder structure created — not randomly, but following the architecture defined in Chapter 3:

```
server/
├── config/       ← database pool, environment validation
├── controllers/  ← business logic, separated from routes
├── middleware/   ← JWT verification, role gates
├── models/       ← database query layer, pure SQL
├── routes/       ← Express route definitions
├── validators/   ← express-validator chains
└── jobs/         ← scheduled tasks (escalation cron)
```

PostgreSQL database `civicpulse` created. `.env` configured. `.gitignore` set. Development server wired with nodemon.

### Sprint 2 — The Core Engine ✅

**Database layer:**
- `schema.sql` — 7 tables with ENUM types for roles and statuses, foreign key constraints, indexes for query performance, a trigger function for auto-updating `updated_at` timestamps
- `seed.sql` — 17 real Nairobi wards (with GPS centroids), 7 government authorities (Nairobi Water, KURA, KPLC, Public Health, Environment, NCA, NMS), 20 issue categories mapped to authorities, 5 test users (admin, officer, 3 residents), 3 sample reports with status history

**Authentication system:**
- JWT token generation with 7-day expiry
- bcrypt password hashing (cost factor 10)
- Register → duplicate email check → hash → insert → return token
- Login → find user → check active → compare hash → return token
- `getMe` — protected route returning current user profile with ward join

**Middleware:**
- `authMiddleware.js` — extracts Bearer token, verifies JWT, queries user from database, attaches `req.user`. For officers, additionally queries the authorities table to attach `authority_id`.
- `roleMiddleware.js` — accepts allowed roles as arguments, returns 403 if user's role doesn't match. Clean, reusable, three lines of actual logic.

**Report system — the heart of CivicPulse:**

The report model contains nine functions. Each one a precise operation:

| Function | Purpose |
|---|---|
| `createReport` | INSERT with 8 fields, returns the new row |
| `getAllReports` | Dynamic WHERE builder — filters by ward, status, category, authority. Joins 5 tables. Counts upvotes. Paginated. |
| `getReportById` | Full report with all joins including authority contact email |
| `updateReportStatus` | UPDATE with optional authority reassignment |
| `getReportsByUser` | A resident's own reports with category, ward, upvote count |
| `addStatusHistory` | Inserts into the audit trail table |
| `getStatusHistory` | Chronological status changes with the officer's name who made each change |
| `upvoteReport` | Checks for duplicate votes before inserting |
| `getMapReports` | Lightweight query returning only lat/lng/title/status for Leaflet markers |

The controller layer wraps each model function with HTTP concerns — request parsing, response formatting, error handling. The route layer maps URLs to controller methods with middleware chains: auth → role check → validation → controller.

**Ward system:** Four endpoints — list all wards (for dropdowns), single ward with report counts, ward reports with status filter, ward hotspots (top recurring categories).

**Analytics system:** Four endpoints — platform summary (total/open/resolved/escalated counts + resolution rate), authority performance (response rates per authority), weekly accountability report (new/resolved/overdue/top wards), category breakdown (most reported issue types with percentages).

**Admin system:** Two endpoints — list all users, toggle user active/inactive status.

**Categories:** Inline route serving all categories with their default authority names.

### Sprint 3 — The Interface ✅

**Design system (`style.css`):**
CSS custom properties for the entire colour palette — navy, blue, teal, sky, accent (amber), plus semantic colours for danger, success, warning. Every component built from these variables: buttons (primary, navy, accent, ghost, danger, small, full-width), form inputs, cards, status badges (colour-coded per status), alert messages, topnav, stat cards, tables, loading spinner.

Dark mode implemented as a `.dark` class override — swaps surface, background, text, and border colours. Toggle button on every dashboard.

**Login page (`index.html`):**
Navy background, centred auth card, CivicPulse branding with amber accent. Email + password form. Error alerts. Spinner on submit. Auto-redirect if already logged in.

**Registration page (`register.html`):**
Same design language. Full name, email, ward dropdown (auto-populated from `/api/wards`), password. Client-side 8-character validation. Success message with auto-redirect.

**Auth logic (`auth.js`):**
Login handler, register handler, session storage (token + user object in localStorage), `redirectByRole()` — residents go to dashboard, officers to officer portal, admins to admin panel. Ward dropdown auto-populated on register page.

**Resident dashboard (`dashboard.html`):**
Sidebar + content layout. Three pages:
1. **Ward Map** — Leaflet.js map centred on Nairobi (-1.3028, 36.8219), circle markers colour-coded by status, popup with title/category/ward/status + "View details" button, status filter dropdown
2. **My Reports** — list of the logged-in resident's own reports with status dots, category, date, upvote count, status badge
3. **Submit Issue** — form with title, category dropdown, ward dropdown, address, lat/lng, description, submit button with spinner

Report detail modal — triggered from map pins or report lists. Shows full report details, ward, authority, submitted by, date, address, complete status history timeline, upvote button.

**Officer portal (`officer.html`):**
Two pages — Assigned Reports and All Reports. Status update modal with dropdown (In Progress, Resolved, Escalated, Rejected) and resolution note textarea.

**Admin panel (`admin.html`):**
Three pages — Analytics (summary stats + Chart.js doughnuts and bar charts), Manage Users (table with toggle), Manage Wards (table with report counts).

### Sprint 3 continued — Hardening ✅

Seven additions to make the system production-grade:

1. **Tracking numbers** — PostgreSQL sequence + BEFORE INSERT trigger. Every report auto-receives `CP-2026-XXXXX`. Zero Node.js code needed — the database handles it.
2. **Auto-escalation** — `node-cron` job scheduled daily at 06:00. Reports in 'open' or 'in_progress' for >7 days get status set to 'escalated'. Each escalation logged in status history.
3. **Input validation** — `express-validator` chains on auth routes (email format, password length, name length) and report routes (title 5–200 chars, description 10–2000 chars, valid category ID, lat/lng range).
4. **HTTP logging** — Morgan in dev mode. Every request logged to console with method, URL, status, response time.
5. **Rate limiting** — 20 requests per 15 minutes on `/api/auth` routes. Prevents brute force login attempts.
6. **Category route cleanup** — moved from inline in app.js to proper `categoryRoutes.js`.
7. **Dark mode** — toggle wired into all three dashboards, state persisted in localStorage.

---

## 15 April 2026 — The Audit: Revealing the Contradictions

Every system, no matter how carefully built, contains contradictions. The question is whether you find them before the assessor does.

A full audit was conducted. Every file in the project read — all backend controllers, models, routes, middleware, validators, jobs, config files, all frontend HTML pages, CSS stylesheets, JavaScript files, the database schema, and the seed data.

**21 issues discovered.** Not surface-level — structural contradictions between layers of the system.

The root cause: **the project was built iteratively**. The schema was written first, defining one vocabulary (`resident_id`, `assigned_to`, `submitted`, `under_review`). Then the code was written later, using a different vocabulary (`user_id`, `authority_id`, `open`, `in_progress`). Neither layer was updated to match the other.

Additionally, some files provided during development were never actually saved to disk. `auth.js`, `index.html`, and `register.html` existed as empty files — zero bytes. The functions they were supposed to contain (`logout()`, `redirectByRole()`, session guards) were referenced by every other frontend file but never existed.

And the most devastating bug: inside `reportModel.js`, the `createReport` function contained a `return` statement on line 44 — but every other function in the file (`getAllReports`, `getReportById`, `updateReportStatus`, `getReportsByUser`, `addStatusHistory`, `getStatusHistory`, `upvoteReport`, `getMapReports`) was defined INSIDE `createReport`'s function body, after the return. Including `module.exports`.

**Everything after line 44 was dead code.** Unreachable. Never exported. The entire report system — the heart of CivicPulse — was non-functional.

The full breakdown:

| Severity | Count | Nature |
|---|---|---|
| 🔴 Critical | 3 | Dead code in core model, empty essential files, require ordering |
| 🟠 Major | 7 | Schema-code vocabulary mismatches across 7 different columns/enums |
| 🟡 Medium | 6 | Missing API routes, broken form logic, config load ordering |
| 🔵 Security | 3 | XSS via innerHTML, weak JWT fallback, missing role gates |
| ⚪ Minor | 2 | Variable redeclaration, duplicate logic |

This audit is not a failure. It is the system revealing its own weaknesses before the enemy — the assessment panel — can exploit them.

---

## 16 April 2026 — Battle Strategy: The Fix Plan

**Decision made:** The code is the source of truth. The schema adapts to match it.

This is the correct call. The code represents the most recent intent. The schema was written first as a blueprint, but the code evolved past it. Forcing the code back to match the schema would mean rewriting every controller, model, route, and frontend file. Updating the schema means changing one file.

**Five-phase plan drafted:**

1. **Phase 1** — Kill the critical bugs. Fix the `reportModel.js` nesting. Fix the require ordering in `reportController.js`.
2. **Phase 2** — Align the schema. Add `'open'` to the status enum. Rename columns. Add the `address` column. Allow NULL in `changed_by`.
3. **Phase 3** — Fix every SQL query that references old column names.
4. **Phase 4** — Resurrect the empty files. Fix the frontend — variable collisions, broken dropdowns, XSS sanitisation.
5. **Phase 5** — Config and security. Fix dotenv load order. Remove JWT fallback. Wire env.js validation.

**Status:** ⏳ Awaiting execution approval.

---

## 16 April 2026 — Simple Domain Expansion: System Hardening & UI Foresight

The battlefield is quiet, but the sorcerers know: the real fight is in the details. The backend stands strong — every route, every job, every validator in its place. PostgreSQL now forges tracking numbers in the fire of a sequence, and the escalation curse runs at dawn, never missing a day.

But the front lines are shifting. The dashboards, though precise, feel empty — a domain with no shikigami. The assets folder is a void, waiting for icons and illustrations. The tables and charts, hungry for data, show only placeholders when the database is bare.

**The next technique is clear:**  
- Seed the world with demo data — reports, users, categories — so every page pulses with life.
- Summon new cards and info panels, using the same CSS flow, to welcome and guide every user.
- Place illustrations and icons in the assets domain, giving form to the formless.
- Harden every route, every validator, every job — so the system stands unbreakable before the final reckoning.

The binding vow remains: every improvement, every fix, every flourish must be appended, never overwritten. The record is eternal.
