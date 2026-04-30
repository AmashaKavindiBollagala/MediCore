-- Migration: Change patient_id from UUID to VARCHAR to support integer IDs from auth-service
-- This fixes the notification issue where auth-service uses SERIAL (integer) IDs

-- Step 1: Remove the existing index
DROP INDEX IF EXISTS idx_appointments_patient_id;

-- Step 2: Alter the patient_id column from UUID to VARCHAR
ALTER TABLE public.appointments 
ALTER COLUMN patient_id TYPE VARCHAR(50);

-- Step 3: Recreate the index
CREATE INDEX idx_appointments_patient_id 
ON public.appointments(patient_id);

-- Step 4: Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'patient_id';
