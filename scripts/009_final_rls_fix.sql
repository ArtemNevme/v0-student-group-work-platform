-- =====================================================
-- FINAL RLS FIX - Drop everything and recreate properly
-- =====================================================

-- Step 1: Drop ALL existing policies on all tables
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view any group" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can insert groups" ON public.groups;

DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can remove themselves" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users can view all group members" ON public.group_members;

DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.invitations;
DROP POLICY IF EXISTS "Group members can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can update invitations sent to them" ON public.invitations;

DROP POLICY IF EXISTS "Group members can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Group members can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Assignment creator can update" ON public.assignments;
DROP POLICY IF EXISTS "Assignment creator can delete" ON public.assignments;

DROP POLICY IF EXISTS "Group members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Group members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Group members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Group members can delete tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view their task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Group members can create task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Assigned users can update their tasks" ON public.task_assignments;

DROP POLICY IF EXISTS "Group members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Group members can send messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;

-- Step 2: Drop all helper functions
DROP FUNCTION IF EXISTS public.is_group_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_group_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.set_group_created_by();

-- Step 3: Disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple, working policies

-- PROFILES: Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- GROUPS: Simple policies without circular references
CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view any group"
  ON public.groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Group creators can update their groups"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON public.groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- GROUP_MEMBERS: Allow viewing all members (breaks recursion)
CREATE POLICY "Authenticated users can view all group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert group members"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own membership"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INVITATIONS
CREATE POLICY "Users can view invitations sent to them"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (invited_email IN (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update invitations sent to them"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (invited_email IN (SELECT email FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (invited_email IN (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- ASSIGNMENTS
CREATE POLICY "Authenticated users can view all assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Assignment creators can update"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Assignment creators can delete"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- TASKS
CREATE POLICY "Authenticated users can view all tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (true);

-- TASK_ASSIGNMENTS
CREATE POLICY "Authenticated users can view all task assignments"
  ON public.task_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create task assignments"
  ON public.task_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Assigned users can update their tasks"
  ON public.task_assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- MESSAGES
CREATE POLICY "Authenticated users can view all messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ACHIEVEMENTS
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- USER_ACHIEVEMENTS
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);
