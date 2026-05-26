-- Create messages table for group chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  assignment_id uuid references public.assignments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('message', 'task', 'deadline', 'invitation', 'achievement')),
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies for messages
create policy "Group members can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = messages.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Group members can create messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_members.group_id = messages.group_id
      and group_members.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

create policy "Users can delete their own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

-- RLS Policies for notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);
