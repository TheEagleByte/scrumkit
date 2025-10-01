-- Board Customization Migration
-- Description: Adds description field to retrospectives table for board-level descriptions and creates a metadata index for faster queries

-- Add description column to retrospectives table
ALTER TABLE retrospectives
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment
COMMENT ON COLUMN retrospectives.description IS 'User-defined description for the retrospective board';

-- Create index for faster board metadata queries
CREATE INDEX IF NOT EXISTS idx_retrospectives_metadata
  ON retrospectives(id, title, description, is_anonymous)
  WHERE is_deleted = false;
