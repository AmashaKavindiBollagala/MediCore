-- Migration: Add indexes for appointment_id lookups
-- This improves performance when filtering prescriptions and reports by appointment

-- Index for prescriptions table
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);

-- Index for patient_reports table
CREATE INDEX IF NOT EXISTS idx_patient_reports_appointment_id ON patient_reports(appointment_id);

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('prescriptions', 'patient_reports') 
  AND indexname LIKE '%appointment_id%';
