-- =============================================
-- PHASE 1: Create Course Materials table
-- Materials synced from Google Classroom
-- =============================================

CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  google_material_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL DEFAULT 'link', -- document, video, link, form, etc.
  url TEXT,
  drive_file_id TEXT,
  drive_file_title TEXT,
  youtube_video_id TEXT,
  form_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique google_material_id per user
  UNIQUE(user_id, google_material_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_materials_subject_id ON course_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_user_id ON course_materials(user_id);

-- Enable RLS
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "course_materials_select" ON course_materials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "course_materials_insert" ON course_materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "course_materials_update" ON course_materials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "course_materials_delete" ON course_materials
  FOR DELETE USING (auth.uid() = user_id);
