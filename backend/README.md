# Opportunity App API — Opportunity Giver + Opportunity Seeker Modules

Stack: Node.js + Express.js + PostgreSQL + Prisma ORM
Validation: express-validator (every required field enforced, per screen spec)

## Setup

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed         # creates first Super Admin + sample master data
npm run dev
```

## Folder Structure

```
prisma/schema.prisma          -> full DB schema (all roles, all screens)
src/app.js                    -> express app + route mounting
src/server.js                 -> server bootstrap
src/config/db.js               -> prisma client
src/middleware/                -> auth, validation, upload, error handling
src/utils/                     -> jwt, otp, response helpers
src/modules/auth/              -> registration, login, OTP, forgot password
src/modules/giver/             -> Opportunity Giver profile, opportunities, applications
src/modules/seeker/            -> Opportunity Seeker profile builder, search, apply, applications
src/modules/admin/              -> Admin Panel: users, certificates, opportunities, master data, reports
src/modules/master/             -> public dropdown/lookup endpoints (Disability Types, Categories)
src/modules/common/            -> messages, notifications, settings (shared)
```

## Opportunity Giver — Endpoints Implemented

All `giver/*` routes require `Authorization: Bearer <token>` and role `GIVER`.

### Auth (public)
| Method | Endpoint | Screen | Body |
|---|---|---|---|
| POST | /api/v1/auth/giver/register | Screen 5 | fullName*, mobileNumber*, email, password*, confirmPassword*, organizationName, city*, state*, acceptedTerms* |
| POST | /api/v1/auth/otp/verify | Screen 6 | mobileNumber*, otp*, purpose* |
| POST | /api/v1/auth/otp/resend | Screen 6 | mobileNumber*, purpose* |
| POST | /api/v1/auth/login | Screen 2 | mobileNumber*, password* |
| POST | /api/v1/auth/forgot-password | — | mobileNumber* |
| POST | /api/v1/auth/reset-password | — | mobileNumber*, otp*, newPassword*, confirmNewPassword* |

### Profile & Dashboard
| Method | Endpoint | Screen |
|---|---|---|
| GET | /api/v1/giver/profile | Screen 25 |
| PUT | /api/v1/giver/profile | Screen 25 (Edit Profile) — multipart, field `profilePhoto` |
| GET | /api/v1/giver/dashboard | Screen 18 |

### Opportunities
| Method | Endpoint | Screen |
|---|---|---|
| POST | /api/v1/giver/opportunities | Screen 20 — multipart, field `media[]`, body per validator below |
| GET | /api/v1/giver/opportunities?page=&limit=&status= | Screen 19 |
| GET | /api/v1/giver/opportunities/:id | Screen 21 |
| PUT | /api/v1/giver/opportunities/:id | Screen 20 (Edit) |
| PATCH | /api/v1/giver/opportunities/:id/close | Screen 19/21 (Close) |
| DELETE | /api/v1/giver/opportunities/:id | Screen 19/21 (Delete) |

Create/Update Opportunity required fields: `title*`, `description*`, `categoryIds*` (1-3, UUIDs), `budgetType*` (FIXED/NEGOTIABLE), `budgetAmount` (required if FIXED), `workMode*` (REMOTE/ONSITE/HYBRID), `city`/`state` (required unless REMOTE), `opportunityDate`, `opportunityTime` (HH:mm).

### Applications Received
| Method | Endpoint | Screen |
|---|---|---|
| GET | /api/v1/giver/opportunities/:opportunityId/applications?page=&limit= | Screen 22 |
| GET | /api/v1/giver/applications/:applicationId | Screen 23 (Applicant Profile) |
| PATCH | /api/v1/giver/applications/:applicationId/status | Shortlist / Accept / Reject |

### Shared (Messages / Notifications / Settings) — any authenticated role
| Method | Endpoint | Screen |
|---|---|---|
| GET | /api/v1/conversations | Screen 24 |
| POST | /api/v1/messages | Screen 16 — multipart, field `attachments[]` (max 5) |
| GET | /api/v1/conversations/:conversationId/messages?page=&limit= | Screen 16 |
| GET | /api/v1/notifications?page=&limit= | Screen 26 |
| PATCH | /api/v1/notifications/:id/read | Screen 26 |
| PUT | /api/v1/settings/password | Screen 27 |
| POST | /api/v1/settings/mobile/request-otp | Screen 27 |
| PUT | /api/v1/settings/mobile | Screen 27 |
| GET/PUT | /api/v1/settings/notification-preferences | Screen 27 |

## Response Shape

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "Validation failed", "errors": [ { "field": "title", "message": "Title is required" } ] }
```

## Opportunity Seeker — Endpoints Implemented

All `seeker/*` routes require `Authorization: Bearer <token>` and role `SEEKER`.

### Auth (public)
| Method | Endpoint | Screen | Body |
|---|---|---|---|
| POST | /api/v1/auth/seeker/register | Screen 4 | multipart: fullName*, mobileNumber*, email, password*, confirmPassword*, dateOfBirth*, gender, city*, state*, disabilityTypeId*, acceptedTerms*, file field `disabilityCertificate`* |

Shares `/otp/verify`, `/otp/resend`, `/login`, `/forgot-password`, `/reset-password` with the Giver flow (Screens 6, 2).

### Profile (Screen 17 view / Screen 8 builder)
| Method | Endpoint |
|---|---|
| GET | /api/v1/seeker/profile |
| PUT | /api/v1/seeker/profile — multipart, field `profilePhoto` |
| POST | /api/v1/seeker/profile/complete — marks profile complete (Screen 8 "Complete Profile" action); requires `bio*` + a photo (uploaded now or already on file) |

Sub-sections, each full Add/Edit/Delete (Screen 8 fields exactly as specified):
| Resource | Endpoints | Required fields |
|---|---|---|
| Education | POST/PUT/DELETE `/profile/education[/:id]` | institution*, degree*, startYear* |
| Experience | POST/PUT/DELETE `/profile/experience[/:id]` | organization*, position*, startDate* |
| Skills | POST/PUT/DELETE `/profile/skills[/:id]` | skillName* |
| Awards | POST/PUT/DELETE `/profile/awards[/:id]` | awardName*, year* |
| Certifications | POST/PUT/DELETE `/profile/certifications[/:id]` | certificationName*, date* |
| Portfolio | POST/PUT/DELETE `/profile/portfolio[/:id]` — multipart, field `media[]` | title* |

### Home / Search / Details (Screens 9, 10, 11)
| Method | Endpoint |
|---|---|
| GET | /api/v1/seeker/home — latest / nearby (by city) / recommended (by remote pref) |
| GET | /api/v1/seeker/opportunities/search?keyword=&categoryId=&budgetMin=&budgetMax=&datePosted=&workMode=&page=&limit= |
| GET | /api/v1/seeker/opportunities/:id — details + `eligibility` flags (mobileVerified, profileCompleted, certificateApproved, alreadyApplied, canApply) |

### Apply / My Applications (Screens 12, 13, 14)
| Method | Endpoint |
|---|---|
| POST | /api/v1/seeker/opportunities/:id/apply — multipart, field `attachments[]` (max 5); requires `proposal*`; blocked unless mobile verified + profile complete + certificate approved |
| GET | /api/v1/seeker/applications?page=&limit=&status= |
| GET | /api/v1/seeker/applications/:id |
| PATCH | /api/v1/seeker/applications/:id/withdraw |

Seekers also use the shared `/api/v1/conversations`, `/api/v1/messages`, `/api/v1/notifications`, `/api/v1/settings/*` routes from the common module (Screens 15, 16, 26, 27).

## Next Modules (not yet built, per your "one by one" plan)
- (none remaining from the original screen set — Admin Panel completes Giver + Seeker + Admin)

## Dropdown / Lookup Data

Any field whose options come from a **database table** (not a fixed enum) has its own dedicated, public, no-auth endpoint under `/api/v1/master/*` — this is what the app calls to populate a dropdown/select, both before and after login:

| Method | Endpoint | Used by |
|---|---|---|
| GET | /api/v1/master/disability-types | Screen 4 (Seeker Registration) — Disability Type dropdown |
| GET | /api/v1/master/categories | Screen 20 (Create/Edit Opportunity) — Category picker; Screen 10 (Search) — Category filter |

Both return only `isActive: true` records as `{ id, name }` pairs — enough to render a dropdown and post back the `id`. They're public (no `Authorization` header needed) because the Disability Type dropdown must work on the registration screen, before any token exists.

Admins manage the full underlying tables (including inactive/legacy entries) via the separate authenticated CRUD endpoints under `/api/v1/admin/master/*` (see Admin Panel section below) — deleting there soft-deactivates rather than removing the row, so old records that opportunities/profiles already reference stay intact but drop out of the public dropdown.

Fields like Gender, Budget Type, Work Mode, Application Status, etc. are fixed enums (not table-backed), so their options are constant and don't need a lookup API — they're documented inline next to each endpoint above.



Admins are a **separate table** (`Admin`), not a `User` role — they log in via `/api/v1/auth/admin/login`, not `/api/v1/auth/login`. Seed the first Super Admin with `npm run prisma:seed` (reads `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`, defaults to `admin@opportunityapp.com` / `Admin@12345`).

All `admin/*` routes require `Authorization: Bearer <admin token>`.

### Auth
| Method | Endpoint | Body |
|---|---|---|
| POST | /api/v1/auth/admin/login | email*, password* |

### Dashboard
| Method | Endpoint |
|---|---|
| GET | /api/v1/admin/dashboard — totals: seekers, givers, active opportunities, applications, pending certificates, pending reports, suspended users |

### Seeker Management
| Method | Endpoint |
|---|---|
| GET | /api/v1/admin/seekers?page=&limit=&search=&status=&certificateStatus= |
| GET | /api/v1/admin/seekers/:id — full profile incl. education/experience/skills/awards/certifications/portfolio |
| PATCH | /api/v1/admin/seekers/:id/certificate — body: `certificateStatus*` (APPROVED/REJECTED), `rejectReason*` (required if REJECTED) |
| PATCH | /api/v1/admin/users/:id/status — body: `status*` (ACTIVE/SUSPENDED/DEACTIVATED), `reason` |

### Giver Management
| Method | Endpoint |
|---|---|
| GET | /api/v1/admin/givers?page=&limit=&search=&status= |
| GET | /api/v1/admin/givers/:id |
| PATCH | /api/v1/admin/users/:id/status — same as above, shared across roles |

### Opportunity Moderation
| Method | Endpoint |
|---|---|
| GET | /api/v1/admin/opportunities?page=&limit=&status=&search= — all statuses, all givers |
| GET | /api/v1/admin/opportunities/:id |
| PATCH | /api/v1/admin/opportunities/:id/close |
| DELETE | /api/v1/admin/opportunities/:id |

### Master Data
| Method | Endpoint | Body |
|---|---|---|
| GET/POST | /api/v1/admin/master/disability-types | POST: name*, isActive |
| PUT/DELETE | /api/v1/admin/master/disability-types/:id | DELETE soft-deactivates |
| GET/POST | /api/v1/admin/master/categories | POST: name*, isActive |
| PUT/DELETE | /api/v1/admin/master/categories/:id | DELETE soft-deactivates |

### Reports & Moderation
| Method | Endpoint | Body |
|---|---|---|
| GET | /api/v1/admin/reports?page=&limit=&status=&targetType= | |
| GET | /api/v1/admin/reports/:id | |
| PATCH | /api/v1/admin/reports/:id | status* (REVIEWED/DISMISSED/ACTION_TAKEN), adminNote |

### Admin Management (Super Admin only)
| Method | Endpoint | Body |
|---|---|---|
| GET | /api/v1/admin/admins | |
| POST | /api/v1/admin/admins | fullName*, email*, password*, isSuperAdmin |
