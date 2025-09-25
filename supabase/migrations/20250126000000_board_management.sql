-- Board Management Migration
-- Description: Updates retrospectives table to support anonymous board creation,
-- unique URLs, board settings, and soft delete functionality

-- Add new columns to retrospectives table
ALTER TABLE retrospectives
  ADD COLUMN IF NOT EXISTS unique_url VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS voting_limit INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS template VARCHAR(50),
  ADD COLUMN IF NOT EXISTS creator_cookie VARCHAR(255);

-- Make team_id nullable for anonymous boards
ALTER TABLE retrospectives
  ALTER COLUMN team_id DROP NOT NULL;

-- Add index for unique_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_retrospectives_unique_url
  ON retrospectives(unique_url)
  WHERE unique_url IS NOT NULL;

-- Add index for listing queries
CREATE INDEX IF NOT EXISTS idx_retrospectives_listing
  ON retrospectives(created_at DESC, is_deleted, is_archived)
  WHERE is_deleted = false;

-- Add index for creator_cookie for anonymous user boards
CREATE INDEX IF NOT EXISTS idx_retrospectives_creator_cookie
  ON retrospectives(creator_cookie)
  WHERE creator_cookie IS NOT NULL;

-- Create a function to generate unique URLs
CREATE OR REPLACE FUNCTION generate_unique_url()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  url_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character string
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    -- Check if URL already exists
    SELECT EXISTS (SELECT 1 FROM retrospectives WHERE unique_url = result) INTO url_exists;

    -- Exit loop if unique URL found
    EXIT WHEN NOT url_exists;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate unique_url if not provided
CREATE OR REPLACE FUNCTION set_unique_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_url IS NULL THEN
    NEW.unique_url := generate_unique_url();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER retrospectives_set_unique_url
  BEFORE INSERT ON retrospectives
  FOR EACH ROW
  EXECUTE FUNCTION set_unique_url();

-- Update existing retrospectives with unique URLs
UPDATE retrospectives
SET unique_url = generate_unique_url()
WHERE unique_url IS NULL;

-- Drop the old RLS policies
DROP POLICY IF EXISTS "Users can view retrospectives of their teams" ON retrospectives;
DROP POLICY IF EXISTS "Team members can create retrospectives" ON retrospectives;
DROP POLICY IF EXISTS "Team members can update retrospectives" ON retrospectives;

-- Create new RLS policies for anonymous access
CREATE POLICY "Anyone can view public retrospectives by URL"
  ON retrospectives FOR SELECT
  USING (
    unique_url IS NOT NULL
    AND is_deleted = false
  );

CREATE POLICY "Anyone can create anonymous retrospectives"
  ON retrospectives FOR INSERT
  WITH CHECK (
    is_anonymous = true
    AND team_id IS NULL
  );

CREATE POLICY "Creators can update their anonymous retrospectives"
  ON retrospectives FOR UPDATE
  USING (
    is_anonymous = true
    AND creator_cookie IS NOT NULL
  )
  WITH CHECK (
    is_anonymous = true
    AND creator_cookie IS NOT NULL
  );

CREATE POLICY "Team members can manage team retrospectives"
  ON retrospectives FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Update policies for retrospective_columns to allow anonymous access
DROP POLICY IF EXISTS "Users can view columns of accessible retrospectives" ON retrospective_columns;
DROP POLICY IF EXISTS "Users can manage columns of their retrospectives" ON retrospective_columns;

CREATE POLICY "Anyone can view columns of accessible retrospectives"
  ON retrospective_columns FOR SELECT
  USING (
    retrospective_id IN (
      SELECT id FROM retrospectives
      WHERE unique_url IS NOT NULL
      AND is_deleted = false
    )
  );

CREATE POLICY "Anyone can manage columns of anonymous retrospectives"
  ON retrospective_columns FOR ALL
  USING (
    retrospective_id IN (
      SELECT id FROM retrospectives
      WHERE is_anonymous = true
    )
  );

-- Update policies for retrospective_items to allow anonymous access
DROP POLICY IF EXISTS "Users can view items in accessible retrospectives" ON retrospective_items;
DROP POLICY IF EXISTS "Users can create items in accessible retrospectives" ON retrospective_items;
DROP POLICY IF EXISTS "Users can update their own items" ON retrospective_items;
DROP POLICY IF EXISTS "Users can delete their own items" ON retrospective_items;

CREATE POLICY "Anyone can view items in accessible retrospectives"
  ON retrospective_items FOR SELECT
  USING (
    column_id IN (
      SELECT rc.id FROM retrospective_columns rc
      JOIN retrospectives r ON r.id = rc.retrospective_id
      WHERE r.unique_url IS NOT NULL
      AND r.is_deleted = false
    )
  );

CREATE POLICY "Anyone can create items in anonymous retrospectives"
  ON retrospective_items FOR INSERT
  WITH CHECK (
    column_id IN (
      SELECT rc.id FROM retrospective_columns rc
      JOIN retrospectives r ON r.id = rc.retrospective_id
      WHERE r.is_anonymous = true
    )
  );

CREATE POLICY "Anyone can update items in anonymous retrospectives"
  ON retrospective_items FOR UPDATE
  USING (
    column_id IN (
      SELECT rc.id FROM retrospective_columns rc
      JOIN retrospectives r ON r.id = rc.retrospective_id
      WHERE r.is_anonymous = true
    )
  );

CREATE POLICY "Anyone can delete items in anonymous retrospectives"
  ON retrospective_items FOR DELETE
  USING (
    column_id IN (
      SELECT rc.id FROM retrospective_columns rc
      JOIN retrospectives r ON r.id = rc.retrospective_id
      WHERE r.is_anonymous = true
    )
  );

-- Update votes table policies for anonymous access
DROP POLICY IF EXISTS "Users can view all votes" ON votes;
DROP POLICY IF EXISTS "Users can create votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

CREATE POLICY "Anyone can view votes in accessible retrospectives"
  ON votes FOR SELECT
  USING (
    item_id IN (
      SELECT ri.id FROM retrospective_items ri
      JOIN retrospective_columns rc ON rc.id = ri.column_id
      JOIN retrospectives r ON r.id = rc.retrospective_id
      WHERE r.unique_url IS NOT NULL
      AND r.is_deleted = false
    )
  );

-- For anonymous voting, we'll handle this through the application layer
-- using cookies to track votes

-- Add comment
COMMENT ON COLUMN retrospectives.unique_url IS 'Unique URL identifier for sharing boards';
COMMENT ON COLUMN retrospectives.title IS 'User-defined title for the retrospective board';
COMMENT ON COLUMN retrospectives.settings IS 'JSON object containing board configuration';
COMMENT ON COLUMN retrospectives.voting_limit IS 'Maximum number of votes per user';
COMMENT ON COLUMN retrospectives.is_anonymous IS 'Whether this is an anonymous board';
COMMENT ON COLUMN retrospectives.is_archived IS 'Soft archive flag';
COMMENT ON COLUMN retrospectives.is_deleted IS 'Soft delete flag';
COMMENT ON COLUMN retrospectives.template IS 'Template used to create the board';
COMMENT ON COLUMN retrospectives.creator_cookie IS 'Cookie identifier for anonymous board creator';