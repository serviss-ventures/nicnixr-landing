-- Add gender field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'prefer-not-to-say'
CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say'));

-- Add age_range field while we're at it
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS age_range VARCHAR(20)
CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+'));

-- Update any existing users who don't have gender set
UPDATE public.users 
SET gender = 'prefer-not-to-say' 
WHERE gender IS NULL;

COMMENT ON COLUMN public.users.gender IS 'User gender preference for personalized recovery milestones';
COMMENT ON COLUMN public.users.age_range IS 'User age range for analytics and personalization'; 