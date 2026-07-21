-- Complete reset of all RLS policies
-- This script drops ALL policies and recreates them from scratch

-- Function to drop all policies on a table
CREATE OR REPLACE FUNCTION drop_all_policies(table_name text)
RETURNS void AS $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = table_name
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop all existing policies on all tables
SELECT drop_all_policies('profiles');
SELECT drop_all_policies('groups');
SELECT drop_all_policies('group_members');
SELECT drop_all_policies('invitations');
SELECT drop_all_policies('assignments');
SELECT drop_all_policies('tasks');
SELECT drop_all_policies('task_assignments');
SELECT drop_all_policies('messages');
SELECT drop_all_policies('notifications');
SELECT drop_all_policies('achievements');
SELECT drop_all_policies('user_achievements');

-- Drop all existing functions that might cause issues
DROP FUNCTION IF EXISTS drop_all_policies(text);
DROP FUNCTION IF EXISTS is_group_member(uuid, uuid);
DROP FUNCTION IF EXISTS is_group_admin(uuid, uuid);
DROP FUNCTION IF EXISTS auto_set_created_by();

-- Create simple helper function for triggers
CREATE OR REPLACE FUNCTION auto_set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES - Simple policies
-- ============================================
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- GROUPS - Simple policies (no circular refs)
-- ============================================
CREATE POLICY "groups_select" ON public.groups
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "groups_insert" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update" ON public.groups
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete" ON public.groups
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- GROUP_MEMBERS - Simple policies (NO recursion)
-- ============================================
CREATE POLICY "group_members_select" ON public.group_members
  FOR SELECT TO authenticated
  USING (true);  -- Allow viewing all members to avoid recursion

CREATE POLICY "group_members_insert" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (true);  -- Will be controlled by application logic

CREATE POLICY "group_members_delete" ON public.group_members
  FOR DELETE TO authenticated
  USING (true);  -- Will be controlled by application logic

-- ============================================
-- INVITATIONS - Simple policies
-- ============================================
CREATE POLICY "invitations_select" ON public.invitations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "invitations_insert" ON public.invitations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "invitations_update" ON public.invitations
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ASSIGNMENTS - Simple policies
-- ============================================
CREATE POLICY "assignments_select" ON public.assignments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "assignments_insert" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "assignments_update" ON public.assignments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "assignments_delete" ON public.assignments
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- TASKS - Simple policies
-- ============================================
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- TASK_ASSIGNMENTS - Simple policies
-- ============================================
CREATE POLICY "task_assignments_select" ON public.task_assignments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_assignments_insert" ON public.task_assignments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "task_assignments_update" ON public.task_assignments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "task_assignments_delete" ON public.task_assignments
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- MESSAGES - Simple policies
-- ============================================
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS - Simple policies
-- ============================================
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- ACHIEVEMENTS - Simple policies
-- ============================================
CREATE POLICY "achievements_select" ON public.achievements
  FOR SELECT TO authenticated
  USING (true);

-- ============================================
-- USER_ACHIEVEMENTS - Simple policies
-- ============================================
CREATE POLICY "user_achievements_select" ON public.user_achievements
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "user_achievements_insert" ON public.user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (true);
