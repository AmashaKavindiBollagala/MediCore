-- Migration: Add phone column to auth.users table
-- This enables SMS notifications for patients and users

-- Add phone column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name = 'phone';
