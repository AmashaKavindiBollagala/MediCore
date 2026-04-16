-- ============================================
-- Appointment Service SQL Schema
-- Creates table: public.appointments
-- ============================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Appointments table in public schema
CREATE TABLE IF NOT EXISTS public.appointments (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id 
ON public.appointments(patient_id);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id 
ON public.appointments(doctor_id);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at 
ON public.appointments(scheduled_at);