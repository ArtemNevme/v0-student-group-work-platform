-- Sync existing imported_courses to subjects (if not already synced)
INSERT INTO subjects (
  id,
  user_id,
  google_course_id,
  name,
  description,
  teacher_name,
  section,
  alternate_link,
  enrollment_code,
  course_state,
  color,
  icon,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  ic.user_id,
  ic.google_course_id,
  ic.name,
  ic.description,
  ic.teacher_name,
  ic.section,
  ic.alternate_link,
  ic.enrollment_code,
  ic.course_state,
  -- Assign random colors based on course name hash
  CASE (hashtext(ic.name) % 8)
    WHEN 0 THEN '#3B82F6' -- blue
    WHEN 1 THEN '#10B981' -- green
    WHEN 2 THEN '#F59E0B' -- amber
    WHEN 3 THEN '#EF4444' -- red
    WHEN 4 THEN '#8B5CF6' -- purple
    WHEN 5 THEN '#EC4899' -- pink
    WHEN 6 THEN '#06B6D4' -- cyan
    ELSE '#F97316' -- orange
  END,
  -- Assign icons based on course name keywords
  CASE 
    WHEN LOWER(ic.name) LIKE '%math%' THEN '📐'
    WHEN LOWER(ic.name) LIKE '%english%' OR LOWER(ic.name) LIKE '%literature%' THEN '📚'
    WHEN LOWER(ic.name) LIKE '%science%' OR LOWER(ic.name) LIKE '%physics%' OR LOWER(ic.name) LIKE '%chemistry%' THEN '🔬'
    WHEN LOWER(ic.name) LIKE '%computer%' OR LOWER(ic.name) LIKE '%programming%' THEN '💻'
    WHEN LOWER(ic.name) LIKE '%history%' THEN '📜'
    WHEN LOWER(ic.name) LIKE '%art%' THEN '🎨'
    WHEN LOWER(ic.name) LIKE '%music%' THEN '🎵'
    WHEN LOWER(ic.name) LIKE '%physical%' OR LOWER(ic.name) LIKE '%sport%' THEN '⚽'
    ELSE '📖'
  END,
  ic.created_at,
  ic.updated_at
FROM imported_courses ic
WHERE NOT EXISTS (
  SELECT 1 FROM subjects s 
  WHERE s.google_course_id = ic.google_course_id 
  AND s.user_id = ic.user_id
);

-- Update assignments to link to subjects based on imported_from_google_id
UPDATE assignments a
SET subject_id = s.id
FROM subjects s
WHERE a.imported_from_google_id IS NOT NULL
  AND a.subject_id IS NULL
  AND s.google_course_id IN (
    SELECT ia.google_course_id 
    FROM imported_assignments ia 
    WHERE ia.google_assignment_id = a.imported_from_google_id
  );

-- Update imported_assignments to link to subjects
UPDATE imported_assignments ia
SET subject_id = s.id
FROM subjects s
WHERE ia.google_course_id = s.google_course_id
  AND ia.subject_id IS NULL;
