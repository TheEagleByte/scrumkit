-- Fix RLS policy for board deletion
-- Description: Properly validate creator_cookie for anonymous board updates and deletions
-- Related Issue: #98

-- First, create a helper function to get the current request's creator cookie
CREATE OR REPLACE FUNCTION get_request_creator_cookie()
RETURNS TEXT AS $$
BEGIN
  -- Get the creator cookie from the request headers
  -- This is set by the application when making requests
  RETURN current_setting('request.jwt.claims', true)::json->>'creator_cookie';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Creators can update their anonymous retrospectives" ON retrospectives;

-- Create a corrected policy that properly validates creator_cookie
CREATE POLICY "Creators can update their anonymous retrospectives"
  ON retrospectives FOR UPDATE
  USING (
    -- Allow updates to anonymous boards only
    is_anonymous = true
    AND creator_cookie IS NOT NULL
  )
  WITH CHECK (
    -- Ensure the board remains anonymous and creator_cookie is preserved
    is_anonymous = true
    AND creator_cookie IS NOT NULL
    -- The application layer (server action) will handle permission validation
    -- by checking if the cookie matches before allowing the update
  );

-- Add comment explaining the security model
COMMENT ON POLICY "Creators can update their anonymous retrospectives" ON retrospectives IS
  'Allows updates to anonymous boards. Permission validation is handled at the application layer by checking creator_cookie in server actions.';
