-- Populate progress milestones for users
-- Run this AFTER running 21_simple_progress_milestones_fix.sql

-- First, check if we have the required columns
DO $$
BEGIN
  -- Only proceed if the table has the required columns
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_milestones' 
    AND column_name = 'milestone_title'
  ) THEN
    
    -- Insert default milestones for all users who don't have them
    INSERT INTO public.progress_milestones (
      user_id, 
      milestone_day, 
      milestone_title, 
      milestone_description,
      is_achieved,
      gender_specific_content,
      nicotine_type_content
    )
    SELECT 
      u.id,
      m.day,
      m.title,
      m.description,
      false,
      '{}'::jsonb,
      '{}'::jsonb
    FROM public.users u
    CROSS JOIN (
      VALUES 
        (1, 'First Day Free', 'Your journey begins'),
        (3, '72 Hour Warrior', 'The hardest part is behind you'),
        (7, 'One Week Strong', 'A full week of freedom'),
        (14, 'Two Week Champion', 'Building new habits'),
        (21, 'Three Week Victor', 'New neural pathways forming'),
        (30, 'One Month Master', 'A major milestone achieved'),
        (60, 'Two Month Titan', 'Transformation in progress'),
        (90, 'Quarter Conqueror', 'Three months of success'),
        (120, 'Four Month Fighter', 'Stronger every day'),
        (180, 'Half Year Hero', 'Six months of freedom'),
        (365, 'One Year Legend', 'A full year nicotine-free'),
        (730, 'Two Year Master', 'Long-term success achieved')
    ) AS m(day, title, description)
    WHERE NOT EXISTS (
      SELECT 1 
      FROM public.progress_milestones pm 
      WHERE pm.user_id = u.id 
      AND pm.milestone_day = m.day
    );
    
    -- Update achievements for existing users based on their quit date
    UPDATE public.progress_milestones pm
    SET 
      is_achieved = true,
      achieved_at = u.quit_date + (pm.milestone_day || ' days')::interval
    FROM public.users u
    WHERE pm.user_id = u.id
    AND u.quit_date IS NOT NULL
    AND pm.milestone_day <= EXTRACT(DAY FROM NOW() - u.quit_date)
    AND pm.is_achieved = false;
    
  ELSE
    RAISE NOTICE 'Table progress_milestones does not have required columns. Please run 21_simple_progress_milestones_fix.sql first.';
  END IF;
END $$; 