-- Fix assignments table to support Google Classroom imports
-- This makes several fields nullable and updates constraints

BEGIN;

-- Step 1: Make group_id nullable (assignments from GC don't need groups)
ALTER TABLE assignments 
  ALTER COLUMN group_id DROP NOT NULL;

-- Step 2: Make deadline nullable (not all GC assignments have deadlines)
ALTER TABLE assignments 
  ALTER COLUMN deadline DROP NOT NULL;

-- Step 3: Update status check constraint to support more statuses
ALTER TABLE assignments 
  DROP CONSTRAINT IF EXISTS assignments_status_check;

ALTER TABLE assignments 
  ADD CONSTRAINT assignments_status_check 
  CHECK (status IN (
    'not_started', 
    'in_progress', 
    'completed',
    'turned_in',        -- Google Classroom status
    'returned',         -- Google Classroom status  
    'reclaimed_by_student' -- Google Classroom status
  ));

-- Step 4: Add default value for status if not provided
ALTER TABLE assignments 
  ALTER COLUMN status SET DEFAULT 'not_started';

COMMIT;

-- Verify changes
SELECT 
  'Verification' as step,
  (SELECT is_nullable FROM information_schema.columns 
   WHERE table_name = 'assignments' AND column_name = 'group_id') as group_id_nullable,
  (SELECT is_nullable FROM information_schema.columns 
   WHERE table_name = 'assignments' AND column_name = 'deadline') as deadline_nullable,
  'Check constraints updated' as status_constraint;
