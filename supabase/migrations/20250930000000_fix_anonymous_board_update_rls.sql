-- Fix RLS policy for anonymous board updates (including deletion)
-- Description: Simplify the update policy to allow all updates on anonymous boards
-- The application layer handles permission checks via creator_cookie validation

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Creators can update their anonymous retrospectives" ON retrospectives;

-- Create a simpler policy that trusts application-level validation
-- The application checks creator_cookie matches before calling update
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

-- Add comment explaining the security model
COMMENT ON POLICY "Creators can update their anonymous retrospectives" ON retrospectives IS
  'Allows updates on anonymous boards. Application layer validates creator_cookie matches before allowing operations.';
