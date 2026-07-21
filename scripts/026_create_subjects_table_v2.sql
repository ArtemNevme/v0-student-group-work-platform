-- =============================================
-- Create Subjects table (simplified version)
-- =============================================

-- Drop existing objects if migration failed
DROP TRIGGER IF EXISTS subjects_updated_at ON subjects;
DROP FUNCTION IF EXISTS update_subjects_updated_at();
DROP TABLE IF EXISTS subjects CASCADE;

-- Create subjects table
CREATE TABLE subjects (
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
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'book',
  is_synced BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, google_course_id)
);

-- Indexes
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_google_course_id ON subjects(google_course_id) WHERE google_course_id IS NOT NULL;

-- RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_select" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subjects_insert" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Updated trigger
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
