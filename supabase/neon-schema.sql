-- ═══════════════════════════════════════════════════════════════
-- SMVS Seva Management System — Neon PostgreSQL Schema
-- Run this in: Neon Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. CENTERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE centers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT,
  admin_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 2. ADMIN USERS  (standalone — no external auth dependency)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role          TEXT NOT NULL CHECK (role IN ('super_admin', 'center_admin')),
  center_id     UUID REFERENCES centers(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
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
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id   UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 5. SEVAS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE sevas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id          UUID NOT NULL REFERENCES seva_assignments(id) ON DELETE CASCADE,
  member_id              TEXT NOT NULL REFERENCES members(global_id),
  seva_id                UUID NOT NULL REFERENCES sevas(id),
  center_id              UUID NOT NULL REFERENCES centers(id),
  completed_date         DATE NOT NULL,
  proof_url              TEXT,
  proof_public_id        TEXT,
  user_suchan            TEXT,
  admin_remark           TEXT,
  remark_media_url          TEXT,
  remark_media_public_id    TEXT,
  media_expires_at          TIMESTAMPTZ,
  remark_media_expires_at   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────────
CREATE INDEX idx_members_center              ON members(center_id);
CREATE INDEX idx_seva_cats_center            ON seva_categories(center_id);
CREATE INDEX idx_sevas_center                ON sevas(center_id);
CREATE INDEX idx_sevas_category              ON sevas(category_id);
CREATE INDEX idx_assignments_seva            ON seva_assignments(seva_id);
CREATE INDEX idx_assignments_member          ON seva_assignments(member_id);
CREATE INDEX idx_assignments_center          ON seva_assignments(center_id);
CREATE INDEX idx_completions_seva            ON seva_completions(seva_id);
CREATE INDEX idx_completions_member          ON seva_completions(member_id);
CREATE INDEX idx_completions_center          ON seva_completions(center_id);
CREATE INDEX idx_completions_expires         ON seva_completions(media_expires_at);
CREATE INDEX idx_completions_remark_expires  ON seva_completions(remark_media_expires_at);
CREATE INDEX idx_admin_users_email           ON admin_users(email);
