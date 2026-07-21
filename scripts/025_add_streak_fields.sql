-- Migration: Add streak fields to profiles table
-- This adds streak tracking capability for gamification

-- Add streak column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'streak'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN streak INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add last_activity_date column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'last_activity_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_activity_date DATE;
  END IF;
END $$;

-- Add longest_streak column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add comment to document the purpose
COMMENT ON COLUMN public.profiles.streak IS 'Current consecutive days of activity';
COMMENT ON COLUMN public.profiles.last_activity_date IS 'Last date user completed a task';
COMMENT ON COLUMN public.profiles.longest_streak IS 'Longest streak ever achieved by user';
