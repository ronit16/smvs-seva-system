# SMVS Seva Management System

> Digital platform for seva distribution & tracking — SMVS Swaminarayan Sanstha

Built with **Next.js 14**, **Supabase**, **Cloudinary**, **Green API (WhatsApp)**, and **Vercel**.

---

## Tech Stack

| Layer | Service | Free Tier |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | Open source |
| Hosting | Vercel | 100 GB bandwidth/month |
| Database + Auth | Supabase | 500 MB, 50k users/month |
| Media Storage | Cloudinary | 25 GB storage + bandwidth |
| WhatsApp | Green API | 500 messages/month |
| Scheduled Tasks | Vercel Cron | Free plan |

---

## Project Structure

```
smvs-seva-system/
├── app/
│   ├── api/
│   │   ├── auth/login/          # Login for all 3 roles
│   │   ├── auth/logout/
│   │   ├── auth/me/
│   │   ├── centers/             # Centers CRUD (super admin)
│   │   ├── members/             # Members CRUD (center-isolated)
│   │   ├── categories/          # Seva categories
│   │   ├── sevas/               # Seva CRUD
│   │   ├── assignments/         # Assignments + WhatsApp notify
│   │   ├── completions/         # Completion submit + Sant remark
│   │   ├── upload/              # Cloudinary upload
│   │   └── cron/
│   │       ├── monthly-reminder/ # 1st of month WhatsApp blast
│   │       ├── weekly-reminder/  # Pre-month-end reminder
│   │       └── media-cleanup/    # 30-day Cloudinary cleanup
│   ├── admin/                   # Center Admin pages
│   ├── super-admin/             # Super Admin pages
│   ├── member/                  # Member app
│   └── login/                   # Login page
├── components/                  # Shared UI components
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── auth.ts                  # JWT session management
│   ├── cloudinary.ts            # Cloudinary helpers
│   ├── whatsapp.ts              # Green API integration
│   └── types.ts                 # TypeScript types
├── supabase/
│   ├── schema.sql               # Full database schema
│   └── seed.sql                 # Sample data
├── middleware.ts                 # Route protection
└── vercel.json                  # Cron schedule
```

---

## Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo>
cd smvs-seva-system
npm install
cp .env.example .env.local
```

### 2. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/schema.sql`
3. Run `supabase/seed.sql` for sample centers
4. Go to **Authentication → Users** → Create admin users:
   - `superadmin@smvs.org` (Super Admin)
   - `admin.ahm@smvs.org` (Ahmedabad Center Admin)
   - etc.
5. Go to **SQL Editor** → Insert admin_users rows (see seed.sql comments)
6. Copy API keys to `.env.local`

### 3. Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `.env.local`

### 4. Green API (WhatsApp) Setup

1. Register at [green-api.com](https://green-api.com)
2. Create instance → scan QR with WhatsApp
3. Copy Instance ID and Token to `.env.local`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables → add all from .env.example
```

The `vercel.json` cron jobs will automatically run:
- **Monthly reminder**: 1st of each month at 8:00 AM
- **Weekly reminder**: Every Monday (sends only in last 7 days of month)
- **Media cleanup**: Every Sunday at 2:00 AM

---

## User Roles

### Super Admin
- Login with email + password via Supabase Auth
- Can see ALL centers and ALL data
- Can add/edit centers, view global reports

### Center Admin
- Login with email + password via Supabase Auth
- Can ONLY see their own center's data
- Manages members, seva categories, sevas, assignments
- Adds Sant remarks to completions
- Views reports

### Member
- Login with **Global ID only** (no password needed)
- Can only see their own assigned sevas
- Submits completion with photo proof
- Views Sant's remarks

---

## WhatsApp Messages Sent Automatically

| Event | Recipients |
|---|---|
| Seva assignment | Leader + all members |
| 1st of month | All active members (pending sevas list) |
| Last week of month (if pending) | Members with pending sevas |

---

## 30-Day Media Auto-Delete

- All Cloudinary photos/videos (completion proof + Sant remarks) expire after 30 days
- A Vercel Cron job runs every Sunday to delete expired media from Cloudinary
- **Text data (Sant remarks, member notes, dates) is NEVER deleted**

---

## Security

- JWT sessions stored in httpOnly cookies
- Middleware enforces role-based access control on all routes
- Supabase RLS enabled on all tables
- Center data is fully isolated — center admins cannot access other centers
- Members cannot see other members' sevas or contact info

---

*Jai Swaminarayan 🙏 — SMVS Swaminarayan Sanstha Seva Management System*
