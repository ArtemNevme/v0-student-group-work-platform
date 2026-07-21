-- Create assignments table
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  title text not null,
  description text,
  deadline timestamptz not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create tasks table (subtasks of assignments)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  title text not null,
  description text,
  estimated_hours numeric,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create task_assignments table (which user is assigned to which task)
create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(task_id, user_id)
);

-- Enable RLS
alter table public.assignments enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;

-- RLS Policies for assignments
create policy "Group members can view assignments"
  on public.assignments for select
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = assignments.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Group members can create assignments"
  on public.assignments for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_members.group_id = assignments.group_id
      and group_members.user_id = auth.uid()
    )
    and auth.uid() = created_by
  );

create policy "Group members can update assignments"
  on public.assignments for update
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = assignments.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Assignment creators can delete assignments"
  on public.assignments for delete
  using (auth.uid() = created_by);

-- RLS Policies for tasks
create policy "Group members can view tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.assignments
      join public.group_members on group_members.group_id = assignments.group_id
      where assignments.id = tasks.assignment_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Group members can create tasks"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.assignments
      join public.group_members on group_members.group_id = assignments.group_id
      where assignments.id = tasks.assignment_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Group members can update tasks"
  on public.tasks for update
  using (
    exists (
      select 1 from public.assignments
      join public.group_members on group_members.group_id = assignments.group_id
      where assignments.id = tasks.assignment_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Group members can delete tasks"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.assignments
      join public.group_members on group_members.group_id = assignments.group_id
      where assignments.id = tasks.assignment_id
      and group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for task_assignments
create policy "Group members can view task assignments"
  on public.task_assignments for select
  using (
    exists (
      select 1 from public.tasks
      join public.assignments on assignments.id = tasks.assignment_id
      join public.group_members on group_members.group_id = assignments.group_id
      where tasks.id = task_assignments.task_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Group members can create task assignments"
  on public.task_assignments for insert
  with check (
    exists (
      select 1 from public.tasks
      join public.assignments on assignments.id = tasks.assignment_id
      join public.group_members on group_members.group_id = assignments.group_id
      where tasks.id = task_assignments.task_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Assigned users can update their task assignments"
  on public.task_assignments for update
  using (auth.uid() = user_id);

create policy "Group members can delete task assignments"
  on public.task_assignments for delete
  using (
    exists (
      select 1 from public.tasks
      join public.assignments on assignments.id = tasks.assignment_id
      join public.group_members on group_members.group_id = assignments.group_id
      where tasks.id = task_assignments.task_id
      and group_members.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
create trigger on_assignments_updated
  before update on public.assignments
  for each row
  execute function public.handle_updated_at();

create trigger on_tasks_updated
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();
