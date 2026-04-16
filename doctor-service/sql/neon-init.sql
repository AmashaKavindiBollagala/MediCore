-- Doctor Service Database Initialization for Neon
-- This creates all tables needed for doctor management in shared Neon database

-- Doctor profiles table (with password field)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  specialty VARCHAR(100) NOT NULL,
  sub_specialty VARCHAR(100),
  hospital VARCHAR(255) NOT NULL,
  hospital_address TEXT,
  medical_license_number VARCHAR(100) UNIQUE NOT NULL,
  license_issuing_authority VARCHAR(255) NOT NULL,
  years_of_experience INTEGER NOT NULL CHECK (years_of_experience >= 0),
  bio TEXT,
  consultation_fee_online DECIMAL(10, 2) DEFAULT 0,
  consultation_fee_physical DECIMAL(10, 2) DEFAULT 0,
  profile_photo_url VARCHAR(500),
  id_card_front_url VARCHAR(500),
  id_card_back_url VARCHAR(500),
  medical_license_url VARCHAR(500),
  degree_certificates_url VARCHAR(500),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor availability schedule
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  consultation_type VARCHAR(20) DEFAULT 'online' CHECK (consultation_type IN ('online', 'physical', 'both')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Doctor exception dates
CREATE TABLE IF NOT EXISTS availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(doctor_id, exception_date)
);

-- Patient reports
CREATE TABLE IF NOT EXISTS patient_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID REFERENCES profiles(id),
  report_url VARCHAR(500) NOT NULL,
  report_type VARCHAR(100),
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  doctor_id UUID REFERENCES profiles(id),
  patient_id UUID NOT NULL,
  prescription_data JSONB NOT NULL,
  notes TEXT,
  issued_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_availability_doctor_id ON availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_reports_doctor_id ON patient_reports(doctor_id);
