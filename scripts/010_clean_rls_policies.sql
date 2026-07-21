-- Clean RLS Policies Migration
-- This script safely drops and recreates all RLS policies using IF EXISTS

-- ============================================================================
-- DROP ALL EXISTING POLICIES (IF EXISTS)
-- ============================================================================

-- Drop policies on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop policies on groups
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Allow authenticated users to create groups" ON public.groups;
DROP POLICY IF EXISTS "Allow users to view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Allow group admins to update groups" ON public.groups;
DROP POLICY IF EXISTS "Allow group admins to delete groups" ON public.groups;

-- Drop policies on group_members
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Allow viewing all group members" ON public.group_members;
DROP POLICY IF EXISTS "Allow group admins to add members" ON public.group_members;
DROP POLICY IF EXISTS "Allow group admins to remove members" ON public.group_members;
DROP POLICY IF EXISTS "Allow users to leave groups" ON public.group_members;

-- Drop policies on invitations
DROP POLICY IF EXISTS "Users can view invitations to their groups" ON public.invitations;
DROP POLICY IF EXISTS "Group admins can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Invited users can view their invitations" ON public.invitations;
DROP POLICY IF EXISTS "Invited users can update invitation status" ON public.invitations;
DROP POLICY IF EXISTS "Allow group admins to create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow invited users to view invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow invited users to update invitations" ON public.invitations;

-- Drop policies on assignments
DROP POLICY IF EXISTS "Users can view assignments in their groups" ON public.assignments;
DROP POLICY IF EXISTS "Group members can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Assignment creators can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Assignment creators can delete assignments" ON public.assignments;
DROP POLICY IF EXISTS "Allow group members to view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Allow group members to create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Allow creators to update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Allow creators to delete assignments" ON public.assignments;

-- Drop policies on tasks
DROP POLICY IF EXISTS "Users can view tasks in their groups" ON public.tasks;
DROP POLICY IF EXISTS "Group members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Group members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Group members can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow group members to view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow group members to create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow group members to update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow group members to delete tasks" ON public.tasks;

-- Drop policies on task_assignments
DROP POLICY IF EXISTS "Users can view their task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Group members can create task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Assigned users can update their tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Group members can delete task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Allow users to view task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Allow group members to create task assignments" ON public.task_assignments;
DROP POLICY IF EXISTS "Allow assigned users to update tasks" ON public.task_assignments;
DROP POLICY IF EXISTS "Allow group members to delete task assignments" ON public.task_assignments;

-- Drop policies on messages
DROP POLICY IF EXISTS "Users can view messages in their groups" ON public.messages;
DROP POLICY IF EXISTS "Group members can send messages" ON public.messages;
DROP POLICY IF EXISTS "Message senders can delete their messages" ON public.messages;
DROP POLICY IF EXISTS "Allow group members to view messages" ON public.messages;
DROP POLICY IF EXISTS "Allow group members to send messages" ON public.messages;
DROP POLICY IF EXISTS "Allow senders to delete messages" ON public.messages;

-- Drop policies on notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow system to create notifications" ON public.notifications;

-- Drop policies on achievements
DROP POLICY IF EXISTS "Users can view all achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow viewing all achievements" ON public.achievements;

-- Drop policies on user_achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "System can award achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Allow users to view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Allow system to award achievements" ON public.user_achievements;

-- Drop helper functions if they exist
DROP FUNCTION IF EXISTS public.is_group_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_group_admin(uuid, uuid);

-- ============================================================================
-- CREATE NEW SIMPLE POLICIES
-- ============================================================================

-- PROFILES: Simple policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- GROUPS: Permissive policies to avoid recursion
CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view all groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Group creators can update groups"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete groups"
  ON public.groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- GROUP_MEMBERS: Allow viewing all members (breaks recursion)
CREATE POLICY "Anyone can view group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INVITATIONS: Simple policies
CREATE POLICY "Users can view invitations"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (true);

-- ASSIGNMENTS: Permissive policies
CREATE POLICY "Users can view all assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (true);

-- TASKS: Permissive policies
CREATE POLICY "Users can view all tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (true);

-- TASK_ASSIGNMENTS: Permissive policies
CREATE POLICY "Users can view all task assignments"
  ON public.task_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create task assignments"
  ON public.task_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update task assignments"
  ON public.task_assignments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete task assignments"
  ON public.task_assignments FOR DELETE
  TO authenticated
  USING (true);

-- MESSAGES: Permissive policies
CREATE POLICY "Users can view all messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- NOTIFICATIONS: User-specific policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ACHIEVEMENTS: Public viewing
CREATE POLICY "Users can view all achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- USER_ACHIEVEMENTS: User-specific
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);
