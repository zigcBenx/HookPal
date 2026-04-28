# UGC Creator Management Platform — Implementation Plan

## Context

Build an app where UGC creators register publicly, fill in their profile data, and get reviewed by admins. Admins create campaigns with payment conditions (base pay for minimum video count within a time period + per-view bonuses). Creators are assigned to campaigns and notified by email. Creators paste video links (TikTok, Instagram, YouTube — auto-detected from URL). Video stats are fetched via RapidAPI on submit, via manual trigger, and via a midnight cron job. The dashboard shows spend, views, and reactions across all creators/campaigns.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Drizzle ORM + SQLite (local file), NextAuth v5, Resend, Recharts.

---

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | crypto.randomUUID() |
| name | text | |
| email | text UNIQUE NOT NULL | |
| password | text | hashed with bcrypt |
| role | text | "admin" or "creator", default "creator" |
| status | text | "applied", "active", "rejected", "terminated", default "applied" |
| phone | text | nullable |
| bio | text | nullable |
| tiktokHandle | text | nullable |
| instagramHandle | text | nullable |
| youtubeHandle | text | nullable |
| country | text | nullable |
| image | text | nullable |
| emailVerified | integer (timestamp) | |
| createdAt | integer (timestamp) | |
| updatedAt | integer (timestamp) | |

### accounts / sessions / verificationTokens
Standard NextAuth tables for the Drizzle adapter.

### campaigns
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text NOT NULL | |
| description | text | |
| status | text | "draft", "active", "completed", "cancelled", default "draft" |
| basePay | real NOT NULL | e.g. 600 (euros) |
| minVideos | integer NOT NULL | e.g. 60 |
| periodDays | integer NOT NULL | 30, 45, or 60 |
| viewBonusThreshold | integer | every X views |
| viewBonusAmount | real | bonus Y euros |
| startDate | integer (timestamp) | |
| endDate | integer (timestamp) | |
| createdBy | text FK users | |
| createdAt / updatedAt | integer (timestamp) | |

### campaignAssignments
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| campaignId | text FK campaigns | |
| creatorId | text FK users | |
| status | text | "assigned", "completed", "removed", default "assigned" |
| assignedAt | integer (timestamp) | |
| deadlineAt | integer (timestamp) | assignedAt + campaign.periodDays |

### videos
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| assignmentId | text FK campaignAssignments | |
| creatorId | text FK users | |
| url | text NOT NULL | pasted by creator |
| platform | text | "tiktok", "instagram", "youtube" — auto-detected |
| externalId | text | extracted video ID from URL |
| views | integer | default 0 |
| likes | integer | default 0 |
| comments | integer | default 0 |
| shares | integer | default 0 |
| lastSyncedAt | integer (timestamp) | |
| createdAt / updatedAt | integer (timestamp) | |

### payments
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| assignmentId | text FK campaignAssignments | |
| creatorId | text FK users | |
| type | text | "base" or "bonus" |
| amount | real NOT NULL | |
| description | text | e.g. "Base pay for 65 videos" |
| createdAt | integer (timestamp) | |

---

## Project Structure

```
gradeclone/
├── app/
│   ├── (auth)/                         # Auth pages (centered card layout)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/                    # Protected app (sidebar layout)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx          # Stats overview (role-dependent)
│   │   ├── campaigns/                  # List, create, detail, edit
│   │   ├── my-videos/page.tsx          # Creator: submit & view videos
│   │   ├── profile/page.tsx            # Creator: edit profile
│   │   └── admin/                      # Admin only
│   │       ├── layout.tsx              # Admin role guard
│   │       ├── creators/               # Manage creators
│   │       ├── payments/page.tsx       # Payment overview
│   │       └── videos/page.tsx         # All videos + sync
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── videos/sync/route.ts        # Manual sync
│   │   └── cron/sync-videos/route.ts   # Midnight cron
│   │
│   ├── unauthorized.tsx / forbidden.tsx
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Landing
│
├── components/
│   ├── ui/                             # shadcn components
│   ├── auth/                           # Login/register forms, user button
│   ├── dashboard/                      # Sidebar, header, charts, stats
│   ├── campaigns/                      # Campaign form, assignment dialog
│   ├── videos/                         # Video submit form
│   ├── creators/                       # Creator table, detail
│   ├── data-table/                     # Reusable table components
│   └── providers/session-provider.tsx
│
├── db/
│   ├── index.ts                        # Drizzle client
│   ├── schema/                         # All table definitions
│   ├── migrations/
│   └── seed.ts
│
├── lib/
│   ├── utils.ts                        # cn() helper (exists)
│   ├── auth.ts                         # NextAuth v5 config
│   ├── dal.ts                          # Auth helpers
│   ├── mail.ts                         # Resend helpers
│   └── video-stats.ts                  # URL parsing + RapidAPI
│
├── actions/                            # Server actions
├── validators/                         # Zod schemas
├── types/                              # TypeScript augmentations
├── emails/                             # React Email templates
├── hooks/
├── proxy.ts                            # Route protection
├── drizzle.config.ts
└── .env.local
```

---

## Packages to Install

```bash
# Production
npm install next-auth@beta @auth/drizzle-adapter bcryptjs resend @react-email/components @tanstack/react-table recharts zod react-hook-form @hookform/resolvers sonner

# Dev
npm install -D @types/bcryptjs
```

```bash
# shadcn/ui components
npx shadcn@latest add form input label card table dialog dropdown-menu avatar separator sidebar sheet tabs badge chart toast select checkbox textarea popover command
```

---

## Implementation Steps

### Step 1 — Database Foundation
- Create `.env.local` with `DATABASE_URL=file:./dev.db`
- Create `db/index.ts` (Drizzle client)
- Create `db/schema/users.ts` (just users first)
- Create `drizzle.config.ts`
- Run `drizzle-kit push`, verify with `drizzle-kit studio`

### Step 2 — Auth (NextAuth v5)
- Add auth tables to schema
- Create `lib/auth.ts` (Credentials provider, JWT strategy, role in callbacks)
- Create API route, session provider, type augmentations
- Seed an admin user, test sign-in

### Step 3 — Route Protection
- Create `proxy.ts` (Next.js 16 convention, NOT middleware.ts)
- Create `lib/dal.ts` (getCurrentUser, requireAuth, requireAdmin)
- Create unauthorized/forbidden pages
- Enable `authInterrupts` in next.config.ts

### Step 4 — Auth Pages
- Zod validators for login/register
- Login + register forms with react-hook-form
- Server actions for register (hash password, insert) and login
- Test full flow: register → login → dashboard

### Step 5 — Dashboard Layout
- Sidebar with navigation, header with user menu
- `(dashboard)/layout.tsx` wrapping all protected pages
- Placeholder dashboard page

### Step 6 — Creator Management (Admin)
- Data table with TanStack Table for creator list
- Status filters (applied/active/rejected/terminated)
- Server actions: approve, reject, terminate
- Creator detail page

### Step 7 — Campaigns
- Add campaigns + campaignAssignments tables
- Campaign CRUD (list, create, detail, edit)
- Assignment dialog to assign creators
- Payment conditions form (base pay, min videos, period, view bonus)

### Step 8 — Videos & Platform Detection
- Add videos table
- URL parser: auto-detect TikTok/Instagram/YouTube from link
- RapidAPI integration for fetching stats
- Creator video submission page
- Admin video overview + manual sync
- Cron endpoint for midnight sync

### Step 9 — Payments
- Add payments table
- Payment calculation: base pay if minVideos met, view bonuses
- Admin payment overview

### Step 10 — Email
- Resend + React Email setup
- Templates: welcome, approved, rejected, campaign assigned
- Integrate into registration, status changes, assignments

### Step 11 — Dashboard & Charts
- Recharts via shadcn chart component
- Admin: total spend, views, active campaigns/creators
- Creator: their videos, earnings, deadlines

### Step 12 — Polish
- Loading states, error boundaries
- Landing page, metadata
- Creator profile editing

---

## Key Technical Decisions

- **JWT session** — role embedded in token, no DB query per request
- **proxy.ts** — Next.js 16 renamed middleware.ts; export named `proxy`
- **authInterrupts** — enables `unauthorized()` / `forbidden()` from next/navigation
- **Server actions must verify auth independently** — proxy alone is not enough
- **Tables added incrementally** — not all at once, only when the step needs them

---

## Environment Variables

```env
DATABASE_URL=file:./dev.db
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAPIDAPI_KEY=<your key>
RAPIDAPI_TIKTOK_HOST=<host>
RAPIDAPI_INSTAGRAM_HOST=<host>
RAPIDAPI_YOUTUBE_HOST=<host>
CRON_SECRET=<secret>
```
