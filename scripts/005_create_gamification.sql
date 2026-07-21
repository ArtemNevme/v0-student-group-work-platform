-- Create achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  points_required integer not null default 0,
  created_at timestamptz default now()
);

-- Create user_achievements table (earned achievements)
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  earned_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- Enable RLS
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- RLS Policies for achievements
create policy "Anyone can view achievements"
  on public.achievements for select
  using (true);

-- RLS Policies for user_achievements
create policy "Users can view all user achievements"
  on public.user_achievements for select
  using (true);

create policy "System can award achievements"
  on public.user_achievements for insert
  with check (true);

-- Insert default achievements
insert into public.achievements (name, description, icon, points_required) values
  ('Early Bird', 'Submit 5 tasks before the deadline', '🐦', 0),
  ('Team Player', 'Help 10 teammates complete their tasks', '🤝', 0),
  ('Streak Master', 'Work on tasks for 7 consecutive days', '🔥', 0),
  ('Deadline Crusher', 'Complete 10 tasks on time', '⚡', 0),
  ('Rising Star', 'Reach level 5', '⭐', 0),
  ('Group Leader', 'Create and manage 3 groups', '👑', 0),
  ('Collaborator', 'Send 100 messages in group chats', '💬', 0),
  ('Overachiever', 'Earn 1000 points', '🏆', 1000)
on conflict (name) do nothing;
