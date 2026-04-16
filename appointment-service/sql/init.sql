-- Appointment Service SQL Schema
-- This file contains the database schema for the appointment service

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  consultation_type VARCHAR(50) DEFAULT 'video',
  symptoms TEXT,
  specialty VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
  payment_id UUID,
  cancelled_by VARCHAR(50),
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_patient_id ON bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_doctor_id ON bookings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
