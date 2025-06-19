-- Add gender and age_range columns to users table if they don't exist
-- This ensures developer tools gender changes persist properly

-- Add gender column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' 
                   AND column_name = 'gender') THEN
        ALTER TABLE public.users ADD COLUMN gender TEXT;
    END IF;
END $$;

-- Add age_range column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' 
                   AND column_name = 'age_range') THEN
        ALTER TABLE public.users ADD COLUMN age_range TEXT;
    END IF;
END $$;

-- Create index for gender for better query performance
CREATE INDEX IF NOT EXISTS idx_users_gender ON public.users(gender);

-- Update any null gender values to 'prefer-not-to-say' as default
UPDATE public.users 
SET gender = 'prefer-not-to-say' 
WHERE gender IS NULL; 