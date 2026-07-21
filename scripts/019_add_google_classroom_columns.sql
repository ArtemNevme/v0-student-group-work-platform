-- Add columns to track Google Classroom imports
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS imported_from_google_id text,
ADD COLUMN IF NOT EXISTS google_classroom_link text,
ADD COLUMN IF NOT EXISTS work_link text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assignments_google_id ON public.assignments(imported_from_google_id);

-- Add comment for documentation
COMMENT ON COLUMN public.assignments.imported_from_google_id IS 'Google Classroom assignment ID if imported from Google Classroom';
COMMENT ON COLUMN public.assignments.google_classroom_link IS 'Link to the original Google Classroom assignment';
COMMENT ON COLUMN public.assignments.work_link IS 'Link to student work (Google Docs, Canvas, etc.)';
