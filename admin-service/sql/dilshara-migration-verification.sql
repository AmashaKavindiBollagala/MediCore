-- Migration: Add doctor verification columns to existing database
-- Run this ONCE on your Neon database to add missing columns
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Add missing columns to auth.users
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add missing columns to doctors.profiles
ALTER TABLE doctors.profiles
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS sub_specialty VARCHAR(100),
ADD COLUMN IF NOT EXISTS hospital VARCHAR(255),
ADD COLUMN IF NOT EXISTS medical_license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS consultation_fee_online DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS consultation_fee_physical DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS medical_license_url TEXT,
ADD COLUMN IF NOT EXISTS medical_id_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','rejected')),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create admin schema and verification_events table if not exists
CREATE SCHEMA IF NOT EXISTS admin;

CREATE TABLE IF NOT EXISTS admin.verification_events (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID         NOT NULL,
  doctor_email VARCHAR(255) NOT NULL,
  status       VARCHAR(20)  NOT NULL CHECK (status IN ('approved', 'rejected')),
  admin_note   TEXT,
  decided_by   UUID         NOT NULL,
  decided_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  emailed      BOOLEAN      DEFAULT FALSE,
  emailed_at   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_events_doctor_id ON admin.verification_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_verification_events_emailed   ON admin.verification_events(emailed);

-- Add ai_analysis column for storing AI license analysis results
ALTER TABLE doctors.profiles
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
