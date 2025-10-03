-- Fix unique_url generation for poker_sessions
-- Description: Updates the set_unique_url trigger to handle empty strings and
--              updates generate_unique_url to check poker_sessions table

-- Update set_unique_url trigger to handle both NULL and empty strings
CREATE OR REPLACE FUNCTION set_unique_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate URL if unique_url is NULL or empty string
  IF NEW.unique_url IS NULL OR NEW.unique_url = '' THEN
    NEW.unique_url := generate_unique_url();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update generate_unique_url to check both retrospectives and poker_sessions tables
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

    -- Check if URL already exists in either table
    SELECT EXISTS (
      SELECT 1 FROM retrospectives WHERE unique_url = result
      UNION
      SELECT 1 FROM poker_sessions WHERE unique_url = result
    ) INTO url_exists;

    -- Exit loop if unique URL found
    EXIT WHEN NOT url_exists;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
