-- Enable Asset Claiming Migration
-- Description: Updates RLS policies to allow claiming anonymous assets (retrospectives and poker sessions)
-- when users sign up or sign in. This allows transitioning ownership from anonymous to authenticated users.

-- ============================================================================
-- RETROSPECTIVES - Update claiming policy
-- ============================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Creators can update their anonymous retrospectives" ON retrospectives;

-- Create new policy that allows both anonymous updates AND claiming
-- This policy allows:
-- 1. Anonymous users to update their boards (checked via creator_cookie in application)
-- 2. Authenticated users to claim anonymous boards (transitioning from is_anonymous=true to false)
CREATE POLICY "Creators can update and claim retrospectives"
  ON retrospectives FOR UPDATE
  USING (
    -- Allow updates on anonymous boards (application validates creator_cookie)
    (is_anonymous = true AND creator_cookie IS NOT NULL)
    OR
    -- Allow authenticated users to update their boards
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
  )
  WITH CHECK (
    -- Allow claiming: anonymous -> authenticated (is_anonymous goes from true to false)
    (is_anonymous = false AND created_by IS NOT NULL)
    OR
    -- Allow anonymous updates (keep as anonymous)
    (is_anonymous = true AND creator_cookie IS NOT NULL)
    OR
    -- Allow authenticated updates
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
  );

COMMENT ON POLICY "Creators can update and claim retrospectives" ON retrospectives IS
  'Allows anonymous board updates and claiming. Application validates creator_cookie before claiming.';

-- ============================================================================
-- POKER SESSIONS - Add claiming policy
-- ============================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Creators can update their poker sessions" ON poker_sessions;

-- Create new policy that allows both authenticated updates AND claiming
-- This policy allows:
-- 1. Anonymous users to update their sessions (checked via creator_cookie in application)
-- 2. Authenticated users to claim anonymous sessions (transitioning from is_anonymous=true to false)
-- 3. Authenticated users to update their own sessions
CREATE POLICY "Creators can update and claim poker sessions"
  ON poker_sessions FOR UPDATE
  USING (
    -- Allow updates on anonymous sessions (application validates creator_cookie)
    (is_anonymous = true AND creator_cookie IS NOT NULL)
    OR
    -- Allow authenticated users to update their sessions
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
  )
  WITH CHECK (
    -- Allow claiming: anonymous -> authenticated (is_anonymous goes from true to false)
    (is_anonymous = false AND created_by IS NOT NULL)
    OR
    -- Allow anonymous updates (keep as anonymous)
    (is_anonymous = true AND creator_cookie IS NOT NULL)
    OR
    -- Allow authenticated updates
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
  );

COMMENT ON POLICY "Creators can update and claim poker sessions" ON poker_sessions IS
  'Allows anonymous session updates and claiming. Application validates creator_cookie before claiming.';
