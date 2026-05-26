-- Make group_id nullable in assignments table
-- Google Classroom assignments don't belong to groups

ALTER TABLE assignments 
ALTER COLUMN group_id DROP NOT NULL;

-- Add comment explaining this change
COMMENT ON COLUMN assignments.group_id IS 'Optional group ID. NULL for Google Classroom assignments that are not associated with a study team.';
