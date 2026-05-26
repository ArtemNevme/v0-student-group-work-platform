-- Add priority and estimated_hours columns to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS estimated_hours integer;

-- Add index for priority filtering
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);

-- Comment for documentation
COMMENT ON COLUMN assignments.priority IS 'Assignment priority: low, medium, high, urgent';
COMMENT ON COLUMN assignments.estimated_hours IS 'Estimated hours to complete the assignment';
