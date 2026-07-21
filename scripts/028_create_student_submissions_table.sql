-- =============================================
-- PHASE 1: Create Student Submissions table
-- Track assignment submissions and grades from Google Classroom
-- =============================================

CREATE TABLE IF NOT EXISTS student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  imported_assignment_id UUID REFERENCES imported_assignments(id) ON DELETE CASCADE,
  google_submission_id TEXT,
  google_course_id TEXT,
  google_coursework_id TEXT,
  
  -- Submission state
  state TEXT DEFAULT 'NEW', -- NEW, CREATED, TURNED_IN, RETURNED, RECLAIMED_BY_STUDENT
  
  -- Grades
  draft_grade NUMERIC,
  assigned_grade NUMERIC,
  max_points NUMERIC,
  
  -- Status flags
  late BOOLEAN DEFAULT false,
  
  -- Timestamps
  creation_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ,
  turned_in_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique google_submission_id per user
  UNIQUE(user_id, google_submission_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_submissions_user_id ON student_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_submissions_subject_id ON student_submissions(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_submissions_assignment_id ON student_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_submissions_state ON student_submissions(state);

-- Enable RLS
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "student_submissions_select" ON student_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "student_submissions_insert" ON student_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_submissions_update" ON student_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "student_submissions_delete" ON student_submissions
  FOR DELETE USING (auth.uid() = user_id);
