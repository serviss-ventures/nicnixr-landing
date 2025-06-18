-- Fix for journal_entries unique constraint
-- This adds the missing constraint that allows upsert operations

-- First, check if the constraint already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE' 
    AND table_name = 'journal_entries'
    AND constraint_name = 'journal_entries_user_id_entry_date_key'
  ) THEN
    -- Add the unique constraint
    ALTER TABLE public.journal_entries 
    ADD CONSTRAINT journal_entries_user_id_entry_date_key 
    UNIQUE (user_id, entry_date);
    
    RAISE NOTICE 'Added unique constraint on (user_id, entry_date)';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END $$;

-- Verify the constraint was added
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'journal_entries'
AND tc.constraint_type = 'UNIQUE';

-- Also verify all columns exist and show the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'journal_entries'
ORDER BY ordinal_position; 