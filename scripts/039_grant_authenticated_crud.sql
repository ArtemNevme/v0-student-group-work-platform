-- Fix "permission denied for table <t>" (42501) for the authenticated role.
-- Tables created by raw SQL migrations never received GRANTs, so only a few
-- tables were accessible through PostgREST/RLS. Grant CRUD to authenticated
-- on all public tables (RLS policies remain the actual guard) and set
-- default privileges so future tables get the same grants automatically.

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
