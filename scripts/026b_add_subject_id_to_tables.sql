-- =============================================
-- Add subject_id to existing tables
-- =============================================

-- Add subject_id to assignments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE assignments ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
    CREATE INDEX idx_assignments_subject_id ON assignments(subject_id);
  END IF;
END $$;

-- Add subject_id to groups
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE groups ADD COLUMN subject_id UUID REFERENCES groups(id) ON DELETE SET NULL;
    CREATE INDEX idx_groups_subject_id ON groups(subject_id);
  END IF;
END $$;
