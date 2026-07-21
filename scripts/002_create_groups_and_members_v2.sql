-- Create groups table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  member_count integer default 1,
  max_members integer default 8,
  invite_code text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create group_members table (many-to-many relationship)
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Create invitations table
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  invited_by uuid references public.profiles(id) on delete cascade not null,
  invited_email text not null,
  invite_code text unique not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Create security definer function that properly bypasses RLS
-- This function uses security definer with elevated privileges to check membership
-- without triggering RLS policies on group_members
create or replace function public.check_group_membership(group_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = group_uuid
    and user_id = user_uuid
  );
$$;

-- Create security definer function to check admin status
create or replace function public.check_group_admin(group_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = group_uuid
    and user_id = user_uuid
    and role = 'admin'
  );
$$;

-- Enable RLS
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.invitations enable row level security;

-- Simplified RLS Policies for groups
create policy "Users can view groups they are members of"
  on public.groups for select
  using (
    created_by = auth.uid()
    or id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Group admins can update their groups"
  on public.groups for update
  using (
    id in (
      select group_id from public.group_members 
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Group admins can delete their groups"
  on public.groups for delete
  using (
    id in (
      select group_id from public.group_members 
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Completely rewritten RLS Policies for group_members to avoid recursion
-- Key insight: Allow users to see ALL group_members rows, but control access at the groups level
create policy "Users can view all group members"
  on public.group_members for select
  using (true);

create policy "Users can insert themselves as members"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can remove themselves from groups"
  on public.group_members for delete
  using (auth.uid() = user_id);

create policy "Group admins can manage members"
  on public.group_members for all
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
      and gm.role = 'admin'
    )
  );

-- RLS Policies for invitations
create policy "Users can view invitations for their groups or sent to them"
  on public.invitations for select
  using (
    invited_by = auth.uid()
    or invited_email = (select email from public.profiles where id = auth.uid())
    or group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  );

create policy "Group members can create invitations"
  on public.invitations for insert
  with check (
    auth.uid() = invited_by
    and group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  );

create policy "Invited users can update invitation status"
  on public.invitations for update
  using (invited_email = (select email from public.profiles where id = auth.uid()));

-- Triggers for updated_at
create trigger on_groups_updated
  before update on public.groups
  for each row
  execute function public.handle_updated_at();

-- Function to update member count
create or replace function public.update_group_member_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.groups
    set member_count = member_count + 1
    where id = NEW.group_id;
  elsif TG_OP = 'DELETE' then
    update public.groups
    set member_count = member_count - 1
    where id = OLD.group_id;
  end if;
  return null;
end;
$$;

-- Trigger to update member count
create trigger on_group_member_change
  after insert or delete on public.group_members
  for each row
  execute function public.update_group_member_count();
