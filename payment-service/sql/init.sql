-- Payment Service SQL Schema
-- This file contains the database schema for the payment service

-- Payment transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_doctor_id ON transactions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON transactions(created_at);
