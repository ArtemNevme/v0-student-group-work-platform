-- Add tables for assignment files and links

-- Assignment files table (stores file metadata, actual files in Vercel Blob)
CREATE TABLE IF NOT EXISTS public.assignment_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Assignment links table
CREATE TABLE IF NOT EXISTS public.assignment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignment_files_assignment ON public.assignment_files(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_links_assignment ON public.assignment_links(assignment_id);

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
