-- Add color field to retrospective_items for card customization
ALTER TABLE retrospective_items
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#ffffff';

-- Add comment to explain the color format
COMMENT ON COLUMN retrospective_items.color IS 'Hex color code for card background (e.g., #ff0000)';