-- ============================================
-- Payment Service SQL Schema
-- Creates table: public.transactions
-- ============================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Payment transactions table in public schema
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50) DEFAULT 'payhere',
    status VARCHAR(20) DEFAULT 'PENDING',
    transaction_type VARCHAR(20) DEFAULT 'payment',
    gateway_transaction_id VARCHAR(255),
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_appointment_id 
ON public.transactions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_transactions_patient_id 
ON public.transactions(patient_id);

CREATE INDEX IF NOT EXISTS idx_transactions_doctor_id 
ON public.transactions(doctor_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status 
ON public.transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
ON public.transactions(created_at);