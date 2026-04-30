-- Fix existing appointments with fake UUIDs
-- This converts fake UUIDs back to integer IDs

-- Update appointments where patient_id is a fake UUID
UPDATE public.appointments
SET patient_id = LPTRIM(patient_id, '0')
WHERE patient_id LIKE '00000000-0000-0000-0000-%'
  AND patient_id ~ '^0{8}-0{4}-0{4}-0{4}-0{12}$';

-- Verify the fix
SELECT id, patient_id, status, scheduled_at
FROM public.appointments
ORDER BY created_at DESC
LIMIT 10;
