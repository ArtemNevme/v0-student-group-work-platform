-- Add is_valid column to google_classroom_connections table
ALTER TABLE google_classroom_connections 
ADD COLUMN IF NOT EXISTS is_valid boolean DEFAULT true;

-- Update existing connections to be valid by default
UPDATE google_classroom_connections 
SET is_valid = true 
WHERE is_valid IS NULL;
