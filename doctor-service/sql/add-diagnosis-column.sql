-- Add diagnosis column to prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS diagnosis TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prescriptions' AND column_name = 'diagnosis';
