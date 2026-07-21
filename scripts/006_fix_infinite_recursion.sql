-- Migration to fix infinite recursion in group_members policies
-- This script drops the problematic policies and creates simpler ones

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can update groups they admin" ON public.groups;
DROP POLICY IF EXISTS "Users can delete groups they admin" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Drop the problematic functions
DROP FUNCTION IF EXISTS public.is_group_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_group_admin(uuid, uuid);

-- Create new helper functions that properly bypass RLS
-- These use SECURITY DEFINER to run with elevated privileges
CREATE OR REPLACE FUNCTION public.check_group_membership(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_member boolean;
BEGIN
  -- Directly check membership without triggering RLS
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = p_group_id 
    AND user_id = p_user_id
  ) INTO v_is_member;
  
  RETURN v_is_member;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_group_admin(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Directly check admin status without triggering RLS
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = p_group_id 
    AND user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  RETURN v_is_admin;
END;
$$;

-- GROUPS TABLE POLICIES (simplified to avoid recursion)
-- Allow users to view groups they're members of using the security definer function
CREATE POLICY "Users can view their groups"
  ON public.groups
  FOR SELECT
  USING (public.check_group_membership(id, auth.uid()));

-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow group admins to update their groups
CREATE POLICY "Group admins can update groups"
  ON public.groups
  FOR UPDATE
  USING (public.check_group_admin(id, auth.uid()))
  WITH CHECK (public.check_group_admin(id, auth.uid()));

-- Allow group admins to delete their groups
CREATE POLICY "Group admins can delete groups"
  ON public.groups
  FOR DELETE
  USING (public.check_group_admin(id, auth.uid()));

-- GROUP_MEMBERS TABLE POLICIES (simplified - no self-reference)
-- Allow anyone to view group members (membership isn't sensitive)
-- This breaks the recursion cycle
CREATE POLICY "Anyone can view group members"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow group admins to add members (with validation)
CREATE POLICY "Group admins can add members"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.check_group_admin(group_id, auth.uid())
  );

-- Allow group admins to remove members
CREATE POLICY "Group admins can remove members"
  ON public.group_members
  FOR DELETE
  USING (public.check_group_admin(group_id, auth.uid()));

-- Allow users to remove themselves (leave group)
CREATE POLICY "Users can leave groups"
  ON public.group_members
  FOR DELETE
  USING (user_id = auth.uid());

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.check_group_membership(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_admin(uuid, uuid) TO authenticated;
