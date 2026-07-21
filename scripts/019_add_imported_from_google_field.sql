-- Add field to track which assignments were imported from Google Classroom
alter table public.assignments 
add column if not exists imported_from_google_id text,
add column if not exists google_classroom_link text;

-- Create index for faster lookups
create index if not exists idx_assignments_imported_from_google on public.assignments(imported_from_google_id);

-- Add comment for documentation
comment on column public.assignments.imported_from_google_id is 'Google Classroom assignment ID if this was imported from Google Classroom';
comment on column public.assignments.google_classroom_link is 'Link to the original Google Classroom assignment';
