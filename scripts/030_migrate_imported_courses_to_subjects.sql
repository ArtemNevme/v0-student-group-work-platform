-- =============================================
-- PHASE 1: Migrate imported_courses to subjects
-- This converts existing imported courses into the new subjects structure
-- =============================================

-- Migration: Insert imported_courses into subjects
INSERT INTO subjects (
  user_id,
  google_course_id,
  name,
  description,
  teacher_name,
  section,
  alternate_link,
  enrollment_code,
  course_state,
  is_synced,
  last_synced_at,
  created_at,
  updated_at
)
SELECT 
  user_id,
  google_course_id,
  name,
  description,
  teacher_name,
  section,
  alternate_link,
  enrollment_code,
  course_state,
  true, -- is_synced
  updated_at, -- last_synced_at
  created_at,
  updated_at
FROM imported_courses
ON CONFLICT (user_id, google_course_id) DO NOTHING;

-- Update imported_assignments to link to subjects via subject lookup
-- First, add subject_id column to imported_assignments if not exists
ALTER TABLE imported_assignments ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

-- Update imported_assignments with subject_id based on google_course_id
UPDATE imported_assignments ia
SET subject_id = s.id
FROM subjects s
WHERE ia.user_id = s.user_id 
  AND ia.google_course_id = s.google_course_id
  AND ia.subject_id IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_imported_assignments_subject_id ON imported_assignments(subject_id);
