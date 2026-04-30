-- Add is_finished column to track finished consultations
-- This tracks which completed appointments have been marked as finished by the doctor

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT FALSE;

-- Create an index for faster queries on finished status
CREATE INDEX IF NOT EXISTS idx_prescriptions_is_finished ON prescriptions(is_finished);

-- Add a comment to explain the column
COMMENT ON COLUMN prescriptions.is_finished IS 'Tracks if the consultation/appointment has been marked as finished by the doctor';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'prescriptions' AND column_name = 'is_finished';
