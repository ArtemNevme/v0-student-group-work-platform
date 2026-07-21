-- =============================================
-- PHASE 1: Create Subjects table
-- Subjects are synced from Google Classroom courses
-- =============================================

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  google_course_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  teacher_name TEXT,
  section TEXT,
  alternate_link TEXT,
  enrollment_code TEXT,
  course_state TEXT DEFAULT 'ACTIVE',
  color TEXT DEFAULT '#3b82f6', -- Default blue color
  icon TEXT DEFAULT 'book',
  is_synced BOOLEAN DEFAULT false, -- true if synced from Google Classroom
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique google_course_id per user
  UNIQUE(user_id, google_course_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_google_course_id ON subjects(google_course_id);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "subjects_select" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subjects_insert" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Add subject_id to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON assignments(subject_id);

-- Add subject_id to groups table (Study Teams)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_groups_subject_id ON groups(subject_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subjects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_subjects_updated_at();
