-- Fix broken foreign key groups.subject_id.
-- The constraint pointed back at public.groups(id) instead of public.subjects(id),
-- which made PostgREST unable to resolve the `subjects (...)` embed and silently
-- broke queries like getMyGroups (group list, sidebar, leaderboard stayed empty).

ALTER TABLE public.groups DROP CONSTRAINT groups_subject_id_fkey;

ALTER TABLE public.groups
  ADD CONSTRAINT groups_subject_id_fkey
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
