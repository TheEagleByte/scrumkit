-- Fix RLS policy for board deletion
-- Description: Allow anonymous board creators to soft delete their boards

-- Replace the update policy to allow soft deletion
DROP POLICY IF EXISTS "Creators can update their anonymous retrospectives" ON retrospectives;

CREATE POLICY "Creators can update their anonymous retrospectives"
  ON retrospectives FOR UPDATE
  USING (
    is_anonymous = true
    AND creator_cookie IS NOT NULL
  )
  WITH CHECK (
    -- Allow soft deletion and archiving operations
    is_anonymous = true
    AND (
      -- Allow setting is_deleted = true (soft delete)
      (NEW.is_deleted = true AND OLD.creator_cookie = NEW.creator_cookie)
      OR
      -- Allow setting is_archived (archive/unarchive)
      (NEW.is_archived IS NOT NULL AND OLD.creator_cookie = NEW.creator_cookie)
      OR
      -- Allow other updates with creator_cookie present
      (creator_cookie IS NOT NULL)
    )
  );