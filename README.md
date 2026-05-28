# ConnectDirectory

> Where professionals connect, collaborate, and grow.

ConnectDirectory is a complete, production-ready SaaS-quality directory & networking platform built on the latest **Next.js 15 App Router**, **Supabase**, **React Flow**, and **Tailwind CSS**. It ships with everything you need to run a polished community: rich public profiles, real-time messaging, an interactive relationship graph, connection requests, notifications, and a modern admin dashboard.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Quick start](#quick-start)
5. [Supabase setup](#supabase-setup)
6. [Environment variables](#environment-variables)
7. [Running locally](#running-locally)
8. [Deploying to Vercel](#deploying-to-vercel)
9. [API examples](#api-examples)
10. [Database schema overview](#database-schema-overview)
11. [Architectural notes](#architectural-notes)

---

## Features

**Authentication**
- Email/password sign in & sign up
- Google OAuth
- Forgot / reset password
- Server-side session refresh via middleware
- Role-based access (`user`, `admin`)
- Protected route guard for `/dashboard`, `/messages`, `/admin`, …

**Profile system**
- Avatar + cover image upload to Supabase Storage
- Occupation, business, bio, contact, location
- Social links: Facebook, Instagram, TikTok, LinkedIn, WhatsApp, X
- Public profile page at `/u/[username]`
- QR-code sharing + copy-link
- Verified badge

**Directory**
- Search by name, username, occupation, company
- Filter by occupation, company, city, country
- Grid & list view
- Sort: newest, alphabetical, most-connected
- Pagination
- SEO-ready metadata + SSR

**Connections**
- Send/accept/decline connection requests
- Real-time notifications when requests change

**Realtime messaging**
- One-to-one chat with Supabase Realtime
- Read receipts
- Typing indicator
- Online status with last-seen heartbeat
- Mobile-friendly chat UI

**Relationship hierarchy**
- 10 relationship types (parent, child, sibling, cousin, spouse, business_partner, employee, manager, friend, mentor)
- Interactive React Flow graph (zoom, pan, minimap)
- Family-tree style + org-chart style
- Color-coded edges and chips

**Admin dashboard**
- Overview stats
- User management (approve / reject / suspend / verify / delete)
- Relation moderation
- Message moderation
- Banner / news publishing
- Analytics (top countries, top occupations, weekly metrics)
- Activity log

**UI/UX**
- Modern minimalist corporate design
- Light & dark mode
- Sidebar navigation
- Responsive mobile-first
- Skeleton loading, empty states, toast notifications, error boundaries
- Tailwind CSS with custom semantic theme tokens

**Progressive Web App (PWA)**
- Installable on mobile and desktop (Add to Home Screen)
- Web app manifest with shortcuts (Directory, Messages, Dashboard)
- Service worker via [Serwist](https://serwist.pages.dev) — offline caching + `/offline` fallback
- Install prompt banner when the browser supports it
- Apple touch icon + maskable icons (192×192, 512×512)

---

## Tech stack

| Layer       | Tech                                                      |
| ----------- | --------------------------------------------------------- |
| Framework   | Next.js 15 (App Router, Server Components, Server Actions) |
| Language    | TypeScript (strict)                                       |
| Styling     | Tailwind CSS, custom design tokens, dark mode             |
| Database    | Supabase (PostgreSQL) with RLS                            |
| Auth        | Supabase Auth (email/password, Google OAuth)              |
| Realtime    | Supabase Realtime (postgres_changes)                      |
| Storage     | Supabase Storage (avatars, covers, banners, uploads)      |
| State       | Zustand (lightweight client state)                        |
| Forms       | React Hook Form + Zod                                     |
| Graph       | React Flow (`@xyflow/react`)                              |
| UI utils    | lucide-react, tailwind-merge, clsx, date-fns              |
| Toasts      | react-hot-toast                                           |
| QR code     | qrcode.react                                              |
| Theming     | next-themes                                               |
| PWA         | Serwist (`@serwist/next`) — service worker + offline      |

---

## Project structure

```
.
├── app/                       # Next.js App Router
│   ├── (auth)/                # Public auth pages (login, register, …)
│   ├── (public)/              # Public site (home, directory, profile, …)
│   ├── (app)/                 # Authenticated user app (dashboard, messages, …)
│   ├── admin/                 # Admin dashboard (admin role only)
│   ├── api/                   # Route handlers (REST endpoints)
│   ├── auth/                  # Supabase callback & sign-out routes
│   ├── layout.tsx             # Root layout (theme, auth, providers)
│   ├── not-found.tsx          # 404 page
│   ├── error.tsx              # Global error boundary
│   └── loading.tsx            # Global loading skeleton
│
├── components/
│   ├── layout/                # Navbar, sidebar, footer, topbar, …
│   ├── profile/               # Profile card, actions, QR card, socials
│   ├── providers/             # Theme, auth, toast providers
│   ├── relations/             # React Flow hierarchy visualization
│   └── ui/                    # Button, Input, Card, Modal, Tabs, Badge, …
│
├── hooks/                     # use-debounce, use-supabase, use-realtime-table
├── lib/
│   ├── supabase/              # Browser, server, middleware, admin clients
│   ├── constants.ts           # App constants, nav links, relation meta
│   ├── utils.ts               # cn, initials, time helpers, …
│   └── validations.ts         # Zod schemas
├── services/                  # Server-friendly data services (profiles, messages, relations, connections)
├── store/                     # Zustand stores (auth, ui, notifications)
├── styles/globals.css         # Tailwind layers + design tokens
├── supabase/
│   ├── schema.sql             # FULL Postgres schema + RLS + triggers + storage
│   └── seed.sql               # Optional demo data
├── types/                     # TypeScript types (Database, Profile, …)
├── middleware.ts              # Supabase session refresh + route guards
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Fill in Supabase keys (see below)

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase setup

### 1. Create the project

1. Sign in at [supabase.com](https://supabase.com).
2. Create a **new project** (any region).
3. Wait for it to provision (~1 min).

### 2. Apply the schema

1. In the Supabase Dashboard, open **SQL Editor → New query**.
2. Paste the **entire contents** of `supabase/schema.sql`.
3. Click **Run**.

This script:
- Creates all tables, indexes, foreign keys, and enums.
- Creates triggers (auto-create a profile on signup, notification triggers).
- Enables Row Level Security and writes all policies.
- Creates the four storage buckets (`avatars`, `covers`, `banners`, `uploads`).
- Subscribes the relevant tables to the `supabase_realtime` publication.

(Optional) Run `supabase/seed.sql` for a few placeholder profile rows.

### 3. Configure Auth providers

In **Authentication → Providers**:

- **Email** is enabled by default.
- **Google** (optional but recommended):
  1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  2. Add **Authorized redirect URI**: `https://<your-project>.supabase.co/auth/v1/callback`.
  3. Paste Client ID and Client Secret into Supabase and enable Google.

In **Authentication → URL Configuration**:
- Set **Site URL** to `http://localhost:3000` (dev) or your production URL.
- Add `http://localhost:3000/**` and your production URL to the allow list.

### 4. Storage

Buckets are created automatically by `schema.sql` and are **public-read / authenticated-write**.

### 5. Promote your account to admin

After signing up at `/register`:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out + back in, then visit `/admin`.

---

## Environment variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_NAME=ConnectDirectory
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in **Supabase Dashboard → Project Settings → API**.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is **server-only**. It must never be exposed to the browser. The codebase keeps it inside `lib/supabase/admin.ts`, which is marked `"server-only"`.

---

## Running locally

```bash
npm run dev        # Start Next.js dev server (Turbopack)
npm run lint       # Lint with ESLint
npm run type-check # TypeScript compile-check
npm run pwa:icons  # Regenerate PNG icons from public/icon.svg
npm run build      # Production build (icons + Serwist service worker)
npm run start      # Start production server
```

### PWA notes

- The service worker is **disabled in development** (`npm run dev`) to avoid stale caches. Test PWA features with `npm run build && npm run start`.
- Open Chrome DevTools → **Application** → Manifest / Service Workers to verify installability.
- On iOS Safari: Share → **Add to Home Screen** (no `beforeinstallprompt`; the install banner is Chrome/Edge/Android).
- Icons are generated from `public/icon.svg` on `postinstall` and before each `build`.

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the project.
3. Add the same env vars from `.env.local` in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (`https://your-app.vercel.app`).
5. Update Supabase **Authentication → URL Configuration** to allow the production URL.
6. Deploy.

Optional optimisations:
- Enable **Vercel Analytics** for traffic insights.
- Set **Project → Functions → Region** to the region closest to your Supabase project.
- Add a custom domain and update both `NEXT_PUBLIC_APP_URL` and the Supabase redirect allow list.

---

## API examples

The repo ships with a couple of REST handlers as a starting point.

### GET `/api/profiles`

Public search endpoint.

```bash
curl "http://localhost:3000/api/profiles?q=designer&country=Philippines&page=1&pageSize=12&sort=alphabetical"
```

Response:

```json
{
  "data": [ /* Profile[] */ ],
  "total": 42,
  "page": 1,
  "pageSize": 12,
  "totalPages": 4
}
```

### GET `/api/me`

Returns the currently signed-in user's profile. 401 if not authenticated.

```bash
curl -H "Cookie: <session-cookie>" http://localhost:3000/api/me
```

---

## Database schema overview

| Table              | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `profiles`         | Public profile (auto-created on signup via trigger)           |
| `social_links`     | Social handles per profile (one-to-one)                        |
| `businesses`       | Optional businesses owned by a profile                        |
| `relations`        | Typed relationships between profiles (family/work/social)     |
| `connections`      | Connection requests (`pending` / `accepted` / `declined`)     |
| `messages`         | Direct messages with `read_status`                             |
| `typing_indicators`| Realtime typing flag per conversation                          |
| `notifications`    | In-app notifications (with auto-trigger on connect & message) |
| `activity_logs`    | Admin audit log                                                |
| `banners`          | Admin-published announcements                                  |
| `profile_stats`    | View aggregating per-profile counts                            |

Row-level security is enabled on every table with policies that:
- Allow public read on approved profiles.
- Allow profile self-edit.
- Allow message access only for sender/receiver.
- Allow admin-only writes on activity logs, banners, etc.
- Allow connection requesters & addressees to manage their own rows.

---

## Architectural notes

- **App Router only.** Server Components fetch data using `@supabase/ssr`; client interactivity (forms, chat, modals) is opt-in with `"use client"`.
- **Server actions are not required** — data is mutated with Supabase from client components, so RLS does the security work.
- **Middleware** (`middleware.ts`) refreshes the Supabase session on every request, and enforces auth/admin guards.
- **Realtime** uses `postgres_changes` subscriptions for messages, typing indicators, profile online status, and notifications.
- **Type safety**: a hand-written `Database` interface in `types/database.ts` powers full IntelliSense on all Supabase queries.
- **State**: Zustand owns ephemeral client state (sidebar open, notifications cache, current auth profile). Server data lives in Server Components and is invalidated with `router.refresh()`.
- **UI tokens**: `styles/globals.css` defines semantic CSS variables (`--surface`, `--ink`, …) so light/dark themes share the same Tailwind utility classes.
- **Accessibility**: focus rings, ARIA labels, keyboard escape, dismissible modals, semantic headings.
- **SEO**: `generateMetadata` per profile page, canonical URLs, Open Graph image fallback to avatar.

---

## Useful scripts after install

Promote a user to admin (Supabase SQL editor):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Reset typing indicators (housekeeping):

```sql
update public.typing_indicators set is_typing = false where updated_at < now() - interval '1 hour';
```

Mark everyone offline (housekeeping):

```sql
update public.profiles set is_online = false where last_seen_at < now() - interval '5 minutes';
```

---

## License

MIT — use it, fork it, ship it.

Built with care for communities and networks that value real connections.
