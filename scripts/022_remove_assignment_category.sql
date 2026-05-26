-- Remove category field from assignments table as it's no longer used
-- We're using date-based filtering instead

alter table public.assignments drop column if exists category;
