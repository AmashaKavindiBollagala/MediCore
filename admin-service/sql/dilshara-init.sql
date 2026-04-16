-- admin-service/sql/dilshara-init.sql
-- Idempotent — safe to run multiple times
-- Creates the admin schema and the verification_events table
-- The notification-service (another team) reads verification_events to send emails

-- ── Admin schema ──────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS admin;

-- ── verification_events ───────────────────────────────────────────────────────
-- Written by admin when approving or rejecting a doctor
-- READ by notification-service to trigger the result email to the doctor
CREATE TABLE IF NOT EXISTS admin.verification_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID        NOT NULL,
  doctor_email VARCHAR(255) NOT NULL,
  status       VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
  admin_note   TEXT,
  decided_by   UUID        NOT NULL,   -- admin's auth.users.id
  decided_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
  emailed      BOOLEAN     DEFAULT FALSE,  -- notification-service flips this to TRUE after sending
  emailed_at   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_events_doctor_id ON admin.verification_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_verification_events_emailed   ON admin.verification_events(emailed);
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
