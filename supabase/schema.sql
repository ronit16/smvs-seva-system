-- ═══════════════════════════════════════════════════════════════
-- SMVS Seva Management System — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. CENTERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE centers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  location    TEXT,
  admin_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 2. ADMIN USERS  (linked to Supabase Auth)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('super_admin', 'center_admin')),
  center_id   UUID REFERENCES centers(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 3. MEMBERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE members (
  global_id   TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  center_id   UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 4. SEVA CATEGORIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE seva_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id   UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 5. SEVAS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE sevas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES seva_categories(id) ON DELETE CASCADE,
  center_id   UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  frequency   TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','one-time','custom')),
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 6. SEVA ASSIGNMENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE seva_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seva_id       UUID NOT NULL REFERENCES sevas(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL REFERENCES members(global_id) ON DELETE CASCADE,
  center_id     UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('leader','member')),
  assigned_date DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (seva_id, member_id)
);

-- ──────────────────────────────────────────────────────────────
-- 7. SEVA COMPLETIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE seva_completions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id          UUID NOT NULL REFERENCES seva_assignments(id) ON DELETE CASCADE,
  member_id              TEXT NOT NULL REFERENCES members(global_id),
  seva_id                UUID NOT NULL REFERENCES sevas(id),
  center_id              UUID NOT NULL REFERENCES centers(id),
  completed_date         DATE NOT NULL,
  proof_url              TEXT,
  proof_public_id        TEXT,           -- Cloudinary public_id for deletion
  user_suchan            TEXT,           -- Member's personal note
  admin_remark           TEXT,           -- Sant's remark (never deleted)
  remark_media_url       TEXT,
  remark_media_public_id TEXT,
  media_expires_at       TIMESTAMPTZ,   -- 30 days from upload
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────────
CREATE INDEX idx_members_center       ON members(center_id);
CREATE INDEX idx_seva_cats_center     ON seva_categories(center_id);
CREATE INDEX idx_sevas_center         ON sevas(center_id);
CREATE INDEX idx_sevas_category       ON sevas(category_id);
CREATE INDEX idx_assignments_seva     ON seva_assignments(seva_id);
CREATE INDEX idx_assignments_member   ON seva_assignments(member_id);
CREATE INDEX idx_assignments_center   ON seva_assignments(center_id);
CREATE INDEX idx_completions_seva     ON seva_completions(seva_id);
CREATE INDEX idx_completions_member   ON seva_completions(member_id);
CREATE INDEX idx_completions_center   ON seva_completions(center_id);
CREATE INDEX idx_completions_expires  ON seva_completions(media_expires_at);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- All data access goes through service role key in API routes,
-- so RLS here acts as a safety net.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE centers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sevas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_completions  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — all our API routes use service role key.
-- These policies apply only when using anon key (front-end direct calls).
-- Since we never use anon key for data ops, the service role handles all.

CREATE POLICY "service_role_all" ON centers           FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON admin_users       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON members           FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON seva_categories   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON sevas             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON seva_assignments  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON seva_completions  FOR ALL USING (auth.role() = 'service_role');
