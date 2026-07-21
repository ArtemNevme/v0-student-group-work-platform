-- ============================================
-- Cleanup Legacy Google Classroom Tables
-- ============================================
-- This script removes deprecated tables that are no longer used
-- Data has been migrated to: subjects, assignments, course_materials
-- ============================================

-- Using DROP IF EXISTS without checking data first (tables may not exist)
-- Drop the legacy tables (they are no longer used)
DROP TABLE IF EXISTS imported_assignments CASCADE;
DROP TABLE IF EXISTS imported_courses CASCADE;

-- Verify cleanup
SELECT 'Cleanup complete!' as status;

-- Show current table counts
SELECT 
  (SELECT COUNT(*) FROM subjects) as subjects_count,
  (SELECT COUNT(*) FROM assignments) as assignments_count,
  (SELECT COUNT(*) FROM course_materials) as materials_count;
