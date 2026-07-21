-- Fix infinite recursion (42P17) in group_members RLS policy.
-- The "Group admins can manage members" policy subqueried group_members itself,
-- causing infinite recursion on any query touching group_members (e.g. "my tasks").
-- Fix: route the admin check through the existing SECURITY DEFINER helper
-- public.check_group_admin(uuid, uuid) (see 006_fix_infinite_recursion.sql),
-- which bypasses RLS and therefore cannot recurse.

DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

CREATE POLICY "Group admins can manage members"
  ON public.group_members FOR ALL
  TO authenticated
  USING (public.check_group_admin(group_id, auth.uid()))
  WITH CHECK (public.check_group_admin(group_id, auth.uid()));
