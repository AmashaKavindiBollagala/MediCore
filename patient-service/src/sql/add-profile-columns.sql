-- Migration: Add profile fields to patients table
-- Run this to add missing columns for patient profile

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
