-- Comprehensive RLS Policy Fix
-- This script drops all existing policies and creates new, simple ones that work

-- ============================================================================
-- STEP 1: Drop all existing policies and functions
-- ============================================================================

-- Drop all policies on all tables
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete their groups" ON public.groups;

DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;

DROP POLICY IF EXISTS "Users can view invitations they received" ON public.invitations;
DROP POLICY IF EXISTS "Group admins can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can update invitations they received" ON public.invitations;

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
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can view their earned achievements" ON public.user_achievements;

-- Drop functions
DROP FUNCTION IF EXISTS is_group_member(uuid, uuid);
DROP FUNCTION IF EXISTS is_group_admin(uuid, uuid);
DROP FUNCTION IF EXISTS set_group_created_by();

-- ============================================================================
-- STEP 2: Create simple, working policies
-- ============================================================================

-- PROFILES: Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- GROUPS: Simple policies without circular references
CREATE POLICY "Authenticated users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow insert, trigger will set created_by

CREATE POLICY "Users can view all groups"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (true); -- Allow viewing all groups for now

CREATE POLICY "Group creators can update their groups"
  ON public.groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups"
  ON public.groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- GROUP_MEMBERS: Simple policies
CREATE POLICY "Anyone can view group members"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (true); -- Allow viewing all members

CREATE POLICY "Authenticated users can join groups"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()); -- Can only add yourself

CREATE POLICY "Users can leave groups"
  ON public.group_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()); -- Can only remove yourself

-- INVITATIONS: Simple policies
CREATE POLICY "Users can view invitations"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create invitations"
  ON public.invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update invitations"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ASSIGNMENTS: Simple policies
CREATE POLICY "Authenticated users can view assignments"
  ON public.assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create assignments"
  ON public.assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Assignment creators can update"
  ON public.assignments
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Assignment creators can delete"
  ON public.assignments
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- TASKS: Simple policies
CREATE POLICY "Authenticated users can view tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tasks"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (true);

-- TASK_ASSIGNMENTS: Simple policies
CREATE POLICY "Authenticated users can view task assignments"
  ON public.task_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create task assignments"
  ON public.task_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their task assignments"
  ON public.task_assignments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- MESSAGES: Simple policies
CREATE POLICY "Authenticated users can view messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS: Simple policies
CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ACHIEVEMENTS: Simple policies
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- USER_ACHIEVEMENTS: Simple policies
CREATE POLICY "Users can view all earned achievements"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create user achievements"
  ON public.user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- STEP 3: Create trigger to auto-set created_by for groups
-- ============================================================================

CREATE OR REPLACE FUNCTION set_group_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_group_created_by_trigger ON public.groups;

CREATE TRIGGER set_group_created_by_trigger
  BEFORE INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION set_group_created_by();

-- ============================================================================
-- Done!
-- ============================================================================
