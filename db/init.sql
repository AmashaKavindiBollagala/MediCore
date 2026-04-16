CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS patients;
CREATE SCHEMA IF NOT EXISTS doctors;
CREATE SCHEMA IF NOT EXISTS appointments;
CREATE SCHEMA IF NOT EXISTS payments;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  suspension_reason TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name VARCHAR(255),
  dob DATE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  specialty VARCHAR(100),
  sub_specialty VARCHAR(100),
  hospital VARCHAR(255),
  medical_license_number VARCHAR(100),
  years_of_experience INTEGER,
  bio TEXT,
  consultation_fee_online DECIMAL(10,2),
  consultation_fee_physical DECIMAL(10,2),
  profile_photo_url TEXT,
  id_card_url TEXT,
  medical_license_url TEXT,
  medical_id_url TEXT,
  verification_status VARCHAR(30) DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','rejected')),
  verified BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  specialty VARCHAR(100),
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(30) DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED')),
  consultation_type VARCHAR(20) DEFAULT 'video' CHECK (consultation_type IN ('video', 'in-person')),
  symptoms TEXT,
  payment_id UUID,
  cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('patient', 'doctor')),
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments.bookings(id),
  patient_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'card',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_type VARCHAR(20) DEFAULT 'payment' CHECK (transaction_type IN ('payment', 'refund')),
  created_at TIMESTAMP DEFAULT NOW()
);

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