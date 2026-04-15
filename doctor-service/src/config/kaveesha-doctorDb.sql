-- Run this to extend the doctors schema for the doctor service
-- Add to db/init.sql OR run manually in pgAdmin

ALTER TABLE doctors.profiles
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS specialty VARCHAR(100),
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
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'pending'
    CHECK (verification_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Availability slots table
CREATE TABLE IF NOT EXISTS doctors.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0=Sunday, 1=Monday, ... 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  consultation_type VARCHAR(20) NOT NULL DEFAULT 'online'
    CHECK (consultation_type IN ('online','physical','both')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- One-off blocked dates / exceptions
CREATE TABLE IF NOT EXISTS doctors.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors.profiles(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);