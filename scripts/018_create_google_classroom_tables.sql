-- Google Classroom Integration Tables

-- Store Google OAuth connection per user
create table if not exists public.google_classroom_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  scopes text,
  connected_at timestamp with time zone default now(),
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Store imported courses from Google Classroom
create table if not exists public.imported_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  google_course_id text not null,
  name text not null,
  section text,
  description text,
  teacher_name text,
  course_state text,
  enrollment_code text,
  alternate_link text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, google_course_id)
);

-- Store imported assignments from Google Classroom
create table if not exists public.imported_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  imported_course_id uuid references public.imported_courses(id) on delete cascade not null,
  google_assignment_id text not null,
  google_course_id text not null,
  title text not null,
  description text,
  due_date timestamp with time zone,
  max_points numeric,
  work_type text,
  state text,
  alternate_link text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, google_assignment_id)
);

-- Enable RLS
alter table public.google_classroom_connections enable row level security;
alter table public.imported_courses enable row level security;
alter table public.imported_assignments enable row level security;

-- RLS Policies for google_classroom_connections
create policy "Users can view own connection"
  on public.google_classroom_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert own connection"
  on public.google_classroom_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own connection"
  on public.google_classroom_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete own connection"
  on public.google_classroom_connections for delete
  using (auth.uid() = user_id);

-- RLS Policies for imported_courses
create policy "Users can view own courses"
  on public.imported_courses for select
  using (auth.uid() = user_id);

create policy "Users can insert own courses"
  on public.imported_courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own courses"
  on public.imported_courses for update
  using (auth.uid() = user_id);

create policy "Users can delete own courses"
  on public.imported_courses for delete
  using (auth.uid() = user_id);

-- RLS Policies for imported_assignments
create policy "Users can view own imported assignments"
  on public.imported_assignments for select
  using (auth.uid() = user_id);

create policy "Users can insert own imported assignments"
  on public.imported_assignments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own imported assignments"
  on public.imported_assignments for update
  using (auth.uid() = user_id);

create policy "Users can delete own imported assignments"
  on public.imported_assignments for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_google_connections_user on public.google_classroom_connections(user_id);
create index if not exists idx_imported_courses_user on public.imported_courses(user_id);
create index if not exists idx_imported_courses_google_id on public.imported_courses(google_course_id);
create index if not exists idx_imported_assignments_user on public.imported_assignments(user_id);
create index if not exists idx_imported_assignments_course on public.imported_assignments(imported_course_id);
create index if not exists idx_imported_assignments_google_id on public.imported_assignments(google_assignment_id);
create index if not exists idx_imported_assignments_due_date on public.imported_assignments(due_date);
