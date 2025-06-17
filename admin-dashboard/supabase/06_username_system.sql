-- Username System Migration
-- Adds permanent usernames and display names for Reddit-like user identity

-- Add username and display_name columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Function to generate unique username for anonymous users
CREATE OR REPLACE FUNCTION public.generate_unique_username()
RETURNS TEXT AS $$
DECLARE
  new_username TEXT;
  username_exists BOOLEAN;
  counter INTEGER := 0;
  adjectives TEXT[] := ARRAY[
    'Strong', 'Brave', 'Bold', 'Fierce', 'Mighty', 
    'Swift', 'Wise', 'Noble', 'Proud', 'Free',
    'Bright', 'Clear', 'Fresh', 'Pure', 'True',
    'Calm', 'Cool', 'Zen', 'Chill', 'Ready'
  ];
  nouns TEXT[] := ARRAY[
    'Warrior', 'Fighter', 'Champion', 'Victor', 'Hero',
    'Phoenix', 'Eagle', 'Lion', 'Tiger', 'Wolf',
    'Mountain', 'Thunder', 'Storm', 'Lightning', 'Wind',
    'Star', 'Sun', 'Moon', 'Sky', 'Dream'
  ];
  adj TEXT;
  noun TEXT;
BEGIN
  -- Select random adjective and noun
  adj := adjectives[1 + floor(random() * array_length(adjectives, 1))];
  noun := nouns[1 + floor(random() * array_length(nouns, 1))];
  
  LOOP
    -- Generate username with optional number suffix
    IF counter = 0 THEN
      new_username := adj || noun;
    ELSE
      new_username := adj || noun || counter::TEXT;
    END IF;
    
    -- Check if username exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE username = new_username) INTO username_exists;
    
    -- If unique, return it
    IF NOT username_exists THEN
      RETURN new_username;
    END IF;
    
    -- Otherwise, increment counter and try again
    counter := counter + 1;
    
    -- Safety check to prevent infinite loop
    IF counter > 9999 THEN
      -- Fall back to timestamp-based username
      RETURN 'NixrUser' || extract(epoch from now())::bigint::text;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing users without usernames
DO $$
DECLARE
  user_record RECORD;
  new_username TEXT;
BEGIN
  FOR user_record IN SELECT id, email FROM public.users WHERE username IS NULL
  LOOP
    -- Generate username based on email or create anonymous username
    IF user_record.email LIKE '%@nixr.app' OR user_record.email LIKE 'user_%' THEN
      -- This is likely an anonymous user
      new_username := public.generate_unique_username();
      UPDATE public.users 
      SET username = new_username, 
          display_name = new_username,
          is_anonymous = true
      WHERE id = user_record.id;
    ELSE
      -- Real email - extract username part
      new_username := split_part(user_record.email, '@', 1);
      -- Ensure uniqueness by adding number if needed
      WHILE EXISTS(SELECT 1 FROM public.users WHERE username = new_username) LOOP
        new_username := split_part(user_record.email, '@', 1) || '_' || floor(random() * 9999)::text;
      END LOOP;
      UPDATE public.users 
      SET username = new_username, 
          display_name = new_username,
          is_anonymous = false
      WHERE id = user_record.id;
    END IF;
  END LOOP;
END $$;

-- Make username NOT NULL after populating existing records
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;

-- Update RLS policies to include username in profile views
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Anyone can view basic public profile info (username, display_name, avatar)
CREATE POLICY "Anyone can view public profiles" ON public.users
  FOR SELECT USING (true);

-- Update the handle_new_user function to generate username for anonymous users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  is_anon BOOLEAN;
BEGIN
  -- Check if this is an anonymous user
  is_anon := (NEW.email IS NULL OR NEW.email = '' OR NEW.email LIKE '%@nixr.app');
  
  -- Generate username
  IF is_anon THEN
    new_username := public.generate_unique_username();
  ELSE
    -- Extract from email and ensure uniqueness
    new_username := split_part(NEW.email, '@', 1);
    WHILE EXISTS(SELECT 1 FROM public.users WHERE username = new_username) LOOP
      new_username := split_part(NEW.email, '@', 1) || '_' || floor(random() * 9999)::text;
    END LOOP;
  END IF;
  
  -- Insert user with username
  INSERT INTO public.users (id, email, username, display_name, is_anonymous)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, NEW.id::text || '@nixr.app'), -- Ensure email is never null
    new_username,
    new_username, -- Display name starts same as username
    is_anon
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert anonymous user to registered user
CREATE OR REPLACE FUNCTION public.convert_anonymous_to_registered(
  user_id UUID,
  new_email TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the user record
  UPDATE public.users
  SET 
    email = new_email,
    is_anonymous = false,
    updated_at = NOW()
  WHERE id = user_id AND is_anonymous = true;
  
  -- Return success
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to ensure anonymous users have @nixr.app emails
ALTER TABLE public.users ADD CONSTRAINT check_anonymous_email 
  CHECK (
    (is_anonymous = true AND email LIKE '%@nixr.app') OR
    (is_anonymous = false)
  );

-- Create view for public user profiles
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  days_clean,
  created_at,
  (SELECT COUNT(*) FROM public.community_posts WHERE user_id = users.id) as post_count,
  (SELECT COUNT(*) FROM public.achievements WHERE user_id = users.id) as achievement_count
FROM public.users;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO anon, authenticated;

-- Update community posts to use username instead of user_id in queries
CREATE OR REPLACE VIEW public.community_feed AS
SELECT 
  cp.id,
  cp.content,
  cp.milestone_type,
  cp.milestone_value,
  cp.loves,
  cp.created_at,
  cp.updated_at,
  u.username,
  u.display_name,
  u.avatar_url,
  (SELECT COUNT(*) FROM public.community_comments WHERE post_id = cp.id) as comment_count,
  (SELECT EXISTS(SELECT 1 FROM public.community_loves WHERE post_id = cp.id AND user_id = auth.uid())) as user_loved
FROM public.community_posts cp
JOIN public.users u ON cp.user_id = u.id
ORDER BY cp.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.community_feed TO anon, authenticated; 