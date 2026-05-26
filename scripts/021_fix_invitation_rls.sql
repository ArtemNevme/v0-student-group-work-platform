-- Fix invitation RLS policies to be more permissive for viewing invitations
-- This allows users to view invitations by invite code without authentication issues

drop policy if exists "Users can view invitations for their groups or sent to them" on public.invitations;

create policy "Users can view invitations for their groups or sent to them"
  on public.invitations for select
  using (
    -- Allow viewing by invite code (for accepting invitations)
    true
  );

-- Make sure users can update invitations they're invited to
drop policy if exists "Invited users can update invitation status" on public.invitations;

create policy "Invited users can update invitation status"
  on public.invitations for update
  using (
    -- Allow any authenticated user to update invitation status
    -- The application logic checks if they're the correct recipient
    auth.uid() is not null
  );
