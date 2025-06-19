-- Community Functions
-- Functions to handle atomic operations on community posts

-- Function to increment loves count
CREATE OR REPLACE FUNCTION increment_loves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET loves = loves + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement loves count
CREATE OR REPLACE FUNCTION decrement_loves(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET loves = GREATEST(loves - 1, 0)  -- Ensure it doesn't go below 0
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_loves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_loves(UUID) TO authenticated; 