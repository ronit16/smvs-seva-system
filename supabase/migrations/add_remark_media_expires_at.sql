-- Migration: add remark_media_expires_at to seva_completions
-- Run this in: Supabase Dashboard → SQL Editor → New Query

ALTER TABLE seva_completions
  ADD COLUMN IF NOT EXISTS remark_media_expires_at TIMESTAMPTZ;   -- 30 days from remark media upload

CREATE INDEX IF NOT EXISTS idx_completions_remark_expires
  ON seva_completions(remark_media_expires_at);
