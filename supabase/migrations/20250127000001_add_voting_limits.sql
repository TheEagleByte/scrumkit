-- Add voting limit configuration to retrospectives table
ALTER TABLE retrospectives
ADD COLUMN IF NOT EXISTS max_votes_per_user INTEGER DEFAULT 5 CHECK (max_votes_per_user >= 0);

-- Add comment for documentation
COMMENT ON COLUMN retrospectives.max_votes_per_user IS 'Maximum number of votes each user can cast in this retrospective. Default is 5.';

-- Create a function to get user's current vote count for a retrospective
CREATE OR REPLACE FUNCTION get_user_vote_count(
  p_retrospective_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vote_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO vote_count
  FROM votes v
  INNER JOIN retrospective_items ri ON v.item_id = ri.id
  INNER JOIN retrospective_columns rc ON ri.column_id = rc.id
  WHERE rc.retrospective_id = p_retrospective_id
    AND v.profile_id = p_user_id;

  RETURN vote_count;
END;
$$;

-- Create a function to check if user can vote
CREATE OR REPLACE FUNCTION can_user_vote(
  p_retrospective_id UUID,
  p_user_id UUID,
  p_item_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_votes INTEGER;
  max_votes INTEGER;
  already_voted BOOLEAN;
BEGIN
  -- Check if user already voted for this item
  SELECT EXISTS(
    SELECT 1 FROM votes
    WHERE item_id = p_item_id AND profile_id = p_user_id
  ) INTO already_voted;

  -- If already voted, they can remove their vote (toggle off)
  IF already_voted THEN
    RETURN TRUE;
  END IF;

  -- Get max votes allowed for this retrospective
  SELECT max_votes_per_user
  INTO max_votes
  FROM retrospectives
  WHERE id = p_retrospective_id;

  -- Get current vote count
  current_votes := get_user_vote_count(p_retrospective_id, p_user_id);

  -- Check if user can add another vote
  RETURN current_votes < max_votes;
END;
$$;

-- Create a view for vote statistics per retrospective
CREATE OR REPLACE VIEW retrospective_vote_stats AS
SELECT
  rc.retrospective_id,
  v.profile_id,
  COUNT(v.id) as votes_used,
  r.max_votes_per_user,
  r.max_votes_per_user - COUNT(v.id) as votes_remaining
FROM votes v
INNER JOIN retrospective_items ri ON v.item_id = ri.id
INNER JOIN retrospective_columns rc ON ri.column_id = rc.id
INNER JOIN retrospectives r ON rc.retrospective_id = r.id
GROUP BY rc.retrospective_id, v.profile_id, r.max_votes_per_user;

-- Add RLS policy for the view
ALTER VIEW retrospective_vote_stats SET (security_invoker = on);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_profile_id ON votes(profile_id);
CREATE INDEX IF NOT EXISTS idx_retrospective_items_column_id ON retrospective_items(column_id);
CREATE INDEX IF NOT EXISTS idx_retrospective_columns_retrospective_id ON retrospective_columns(retrospective_id);