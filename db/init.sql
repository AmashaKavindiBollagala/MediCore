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
  created_at TIMESTAMP DEFAULT NOW()
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
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  specialty VARCHAR(100),
  sub_specialty VARCHAR(100),
  hospital VARCHAR(255),
  medical_license_number VARCHAR(100),
  years_of_experience INTEGER,
  bio TEXT,
  consultation_fee_online DECIMAL(10, 2) DEFAULT 0,
  consultation_fee_physical DECIMAL(10, 2) DEFAULT 0,
  profile_photo_url VARCHAR(500),
  id_card_url VARCHAR(500),
  medical_license_url VARCHAR(500),
  medical_id_url VARCHAR(500),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor availability schedule
CREATE TABLE IF NOT EXISTS doctors.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  consultation_type VARCHAR(20) DEFAULT 'online' CHECK (consultation_type IN ('online', 'physical', 'both')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Doctor exception dates (blocked dates)
CREATE TABLE IF NOT EXISTS doctors.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors.profiles(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(doctor_id, exception_date)
);

-- Patient uploaded reports
CREATE TABLE IF NOT EXISTS doctors.patient_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments.bookings(id),
  patient_id UUID NOT NULL,
  doctor_id UUID REFERENCES doctors.profiles(id),
  report_url VARCHAR(500) NOT NULL,
  report_type VARCHAR(100),
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Digital prescriptions
CREATE TABLE IF NOT EXISTS doctors.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments.bookings(id),
  doctor_id UUID REFERENCES doctors.profiles(id),
  patient_id UUID NOT NULL,
  prescription_data JSONB NOT NULL,
  notes TEXT,
  issued_at TIMESTAMP DEFAULT NOW()
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

