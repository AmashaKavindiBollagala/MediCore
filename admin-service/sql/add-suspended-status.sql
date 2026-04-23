-- Migration: Add 'suspended' status to profiles verification_status constraint
-- This allows admin to suspend doctor accounts

-- Step 1: Drop the existing check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;

-- Step 2: Add new check constraint with 'suspended' included
ALTER TABLE profiles 
ADD CONSTRAINT profiles_verification_status_check 
CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Verify the change
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'c';

-- ============================================
-- USER STATUS MANAGEMENT
-- ============================================

-- Step 3: Add status column to auth.users if it doesn't exist
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'suspended', 'banned'));

-- Step 4: Add suspension_reason column
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Step 5: Add last_login column if it doesn't exist
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Step 6: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON auth.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON auth.users(role);

-- Verify user table changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('status', 'suspension_reason', 'last_login')
ORDER BY column_name;
