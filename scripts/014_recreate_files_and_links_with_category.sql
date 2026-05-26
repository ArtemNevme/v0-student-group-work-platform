-- Drop and recreate assignment_files and assignment_links tables with all necessary columns

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.assignment_files CASCADE;
DROP TABLE IF EXISTS public.assignment_links CASCADE;

-- Assignment files table (stores file metadata, actual files in Vercel Blob)
CREATE TABLE public.assignment_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Assignment links table with category field
CREATE TABLE public.assignment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  category text CHECK (category IN ('news', 'book', 'scientific', 'video', 'other', 'ai_recommended')),
  created_at timestamptz DEFAULT now()
);

-- Add work_link field to assignments table if it doesn't exist
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS work_link text;

-- Create indexes
CREATE INDEX idx_assignment_files_assignment ON public.assignment_files(assignment_id);
CREATE INDEX idx_assignment_links_assignment ON public.assignment_links(assignment_id);
CREATE INDEX idx_assignment_links_category ON public.assignment_links(category);

-- Enable RLS
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignment_files
CREATE POLICY "assignment_files_select"
  ON public.assignment_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "assignment_files_insert"
  ON public.assignment_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "assignment_files_delete"
  ON public.assignment_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- RLS Policies for assignment_links
CREATE POLICY "assignment_links_select"
  ON public.assignment_links
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "assignment_links_insert"
  ON public.assignment_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "assignment_links_update"
  ON public.assignment_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = added_by);

CREATE POLICY "assignment_links_delete"
  ON public.assignment_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = added_by);

-- Add comments
COMMENT ON COLUMN public.assignment_links.category IS 'Type of source: news, book, scientific, video, other, or ai_recommended for AI-generated recommendations';
COMMENT ON COLUMN public.assignments.work_link IS 'Link to where the main work is being done (Google Docs, Canvas, etc.)';
