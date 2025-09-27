-- Fix security definer functions to prevent search_path hijacking

-- Update get_user_vote_count function with fixed search path
CREATE OR REPLACE FUNCTION get_user_vote_count(
  p_retrospective_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vote_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO vote_count
  FROM public.votes v
  INNER JOIN public.retrospective_items ri ON v.item_id = ri.id
  INNER JOIN public.retrospective_columns rc ON ri.column_id = rc.id
  WHERE rc.retrospective_id = p_retrospective_id
    AND v.profile_id = p_user_id;

  RETURN vote_count;
END;
$$;

-- Update can_user_vote function with fixed search path
CREATE OR REPLACE FUNCTION can_user_vote(
  p_retrospective_id UUID,
  p_user_id UUID,
  p_item_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_votes INTEGER;
  max_votes INTEGER;
  already_voted BOOLEAN;
BEGIN
  -- Check if user already voted for this item
  SELECT EXISTS(
    SELECT 1 FROM public.votes
    WHERE item_id = p_item_id AND profile_id = p_user_id
  ) INTO already_voted;

  -- If already voted, they can remove their vote (toggle off)
  IF already_voted THEN
    RETURN TRUE;
  END IF;

  -- Get max votes allowed for this retrospective
  SELECT max_votes_per_user
  INTO max_votes
  FROM public.retrospectives
  WHERE id = p_retrospective_id;

  -- Get current vote count
  current_votes := get_user_vote_count(p_retrospective_id, p_user_id);

  -- Check if user can add another vote
  RETURN current_votes < max_votes;
END;
$$;