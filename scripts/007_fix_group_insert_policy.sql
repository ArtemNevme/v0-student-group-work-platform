-- Fix the INSERT policy for groups table
-- The issue is that the WITH CHECK clause might be too restrictive

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;

-- Create a simpler INSERT policy that just checks authentication
-- The created_by field will be set by the application
CREATE POLICY "Authenticated users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add a trigger to ensure created_by is always set to the current user
-- This provides security at the database level
CREATE OR REPLACE FUNCTION public.set_group_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always set created_by to the current authenticated user
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS ensure_group_creator ON public.groups;

-- Create trigger that runs before insert
CREATE TRIGGER ensure_group_creator
  BEFORE INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_group_creator();
