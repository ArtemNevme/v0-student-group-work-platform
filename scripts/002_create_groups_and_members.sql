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

-- Create security definer function to check group membership without triggering RLS
create or replace function public.is_group_member(group_uuid uuid, user_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.group_members
    where group_id = group_uuid
    and user_id = user_uuid
  );
end;
$$;

-- Create security definer function to check if user is group admin
create or replace function public.is_group_admin(group_uuid uuid, user_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.group_members
    where group_id = group_uuid
    and user_id = user_uuid
    and role = 'admin'
  );
end;
$$;

-- Enable RLS
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.invitations enable row level security;

-- RLS Policies for groups - using security definer functions
create policy "Users can view groups they are members of"
  on public.groups for select
  using (public.is_group_member(id, auth.uid()));

create policy "Users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Group admins can update their groups"
  on public.groups for update
  using (public.is_group_admin(id, auth.uid()));

create policy "Group admins can delete their groups"
  on public.groups for delete
  using (public.is_group_admin(id, auth.uid()));

-- RLS Policies for group_members - simplified to avoid recursion
create policy "Users can view members of their groups"
  on public.group_members for select
  using (public.is_group_member(group_id, auth.uid()));

create policy "Users can join groups (insert themselves)"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Group admins can add members"
  on public.group_members for insert
  with check (public.is_group_admin(group_id, auth.uid()));

create policy "Users can leave groups (delete themselves)"
  on public.group_members for delete
  using (auth.uid() = user_id);

create policy "Group admins can remove members"
  on public.group_members for delete
  using (public.is_group_admin(group_id, auth.uid()));

-- RLS Policies for invitations - using security definer functions
create policy "Users can view invitations for their groups"
  on public.invitations for select
  using (
    public.is_group_member(group_id, auth.uid())
    or invited_email = (select email from public.profiles where id = auth.uid())
  );

create policy "Group members can create invitations"
  on public.invitations for insert
  with check (
    public.is_group_member(group_id, auth.uid())
    and auth.uid() = invited_by
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
