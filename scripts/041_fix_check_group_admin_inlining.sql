-- Fix 041: prevent inline expansion of check_group_admin from re-introducing RLS recursion.
-- The function was originally SQL (STABLE SECURITY DEFINER), which Postgres can inline
-- into the outer query plan. Once inlined, the RLS policies on group_members apply to
-- the inner SELECT, including the ALL policy that calls check_group_admin itself,
-- producing 42P17 infinite recursion on queries that touch group_members.
-- Switching to PL/pgSQL makes the call non-inlinable and keeps the SECURITY DEFINER
-- bypass intact. Also re-create check_group_membership for symmetry.

-- Drop the dependent policy first so the SQL function can be replaced.
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Drop the old SQL definition so the new PL/pgSQL version can replace it cleanly.
DROP FUNCTION IF EXISTS public.check_group_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.check_group_membership(uuid, uuid);

CREATE OR REPLACE FUNCTION public.check_group_membership(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_member boolean;
BEGIN
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

-- Make sure authenticated users can call the helpers.
GRANT EXECUTE ON FUNCTION public.check_group_membership(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_membership(uuid, uuid) TO public;
GRANT EXECUTE ON FUNCTION public.check_group_admin(uuid, uuid) TO public;

-- Re-create the admin-management policy with the new PL/pgSQL helper.
CREATE POLICY "Group admins can manage members"
  ON public.group_members FOR ALL
  TO authenticated
  USING (public.check_group_admin(group_id, auth.uid()))
  WITH CHECK (public.check_group_admin(group_id, auth.uid()));
