-- Add category field to assignments table
alter table public.assignments
add column if not exists category text default 'project' 
check (category in ('project', 'homework', 'exam', 'presentation', 'lab', 'other'));

-- Add index for faster filtering
create index if not exists idx_assignments_category on public.assignments(category);

-- Update existing assignments to have default category
update public.assignments set category = 'project' where category is null;
