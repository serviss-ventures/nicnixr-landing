-- Add RLS policies for community post and comment deletion
-- This ensures users can only delete their own posts and comments

-- Enable RLS on community_posts if not already enabled
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on community_comments if not already enabled
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policies if they exist
DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_comments;

-- Create policy: Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.community_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Users can only delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.community_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Also ensure select, insert, and update policies exist
-- For community_posts
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;
CREATE POLICY "Anyone can view posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
CREATE POLICY "Users can create posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- For community_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_comments;
CREATE POLICY "Anyone can view comments"
ON public.community_comments
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.community_comments;
CREATE POLICY "Users can create comments"
ON public.community_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.community_comments;
CREATE POLICY "Users can update own comments"
ON public.community_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- For community_loves
ALTER TABLE public.community_loves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view loves" ON public.community_loves;
CREATE POLICY "Anyone can view loves"
ON public.community_loves
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can manage own loves" ON public.community_loves;
CREATE POLICY "Users can manage own loves"
ON public.community_loves
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 