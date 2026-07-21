-- Add unique constraints to prevent duplicate subjects
-- This ensures Google Classroom courses are synced once per user

ALTER TABLE subjects
  ADD CONSTRAINT subjects_user_google_course_unique 
  UNIQUE (user_id, google_course_id);

-- Add unique constraint for materials to prevent duplicates
ALTER TABLE course_materials
  ADD CONSTRAINT course_materials_google_material_unique
  UNIQUE (google_material_id);

-- Add unique constraint for assignments to prevent duplicates
ALTER TABLE assignments
  ADD CONSTRAINT assignments_google_assignment_unique
  UNIQUE (imported_from_google_id)
  WHERE imported_from_google_id IS NOT NULL;

-- Update any duplicate subjects by keeping the most recent one
DELETE FROM subjects a USING subjects b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.google_course_id = b.google_course_id
  AND a.google_course_id IS NOT NULL;

COMMENT ON CONSTRAINT subjects_user_google_course_unique ON subjects IS 
  'Ensures each Google Classroom course is imported only once per user';
