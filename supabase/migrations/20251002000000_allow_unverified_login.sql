-- Update profile creation to support unverified users
-- This allows users to login immediately after signup while still tracking verification status

-- Drop existing triggers and function
DROP TRIGGER IF EXISTS on_auth_user_created_insert ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function to create profiles for ALL users (verified or not)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for all users, regardless of email confirmation status
  -- The email_confirmed_at field from auth.users will be tracked separately
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for INSERT events (when user signs up)
-- This now fires for ALL new users, not just confirmed ones
CREATE TRIGGER on_auth_user_created_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for UPDATE events (when user confirms email)
-- This ensures that if a user's email gets confirmed later, we still create their profile
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a user profile after signup. Email verification status is tracked via auth.users.email_confirmed_at';
