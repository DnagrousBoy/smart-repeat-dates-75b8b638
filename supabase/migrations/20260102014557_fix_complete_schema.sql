/*
  # Fix Complete Schema
  
  This migration ensures all necessary tables exist.
  It handles the case where the base table was missing.

  1. Types
    - Ensure 'entry_frequency' enum exists
  
  2. Tables
    - Ensure 'calendar_entries' exists (Base table)
    - Ensure 'entry_statuses' exists (New feature)
  
  3. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- 1. Create Enum if not exists
DO $$ BEGIN
    CREATE TYPE entry_frequency AS ENUM ('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', '3_MONTHLY', '6_MONTHLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create calendar_entries table if not exists
CREATE TABLE IF NOT EXISTS public.calendar_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC,
    date DATE NOT NULL,
    end_date DATE,
    frequency entry_frequency NOT NULL DEFAULT 'MONTHLY',
    is_paused BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on calendar_entries
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy for calendar_entries (safely drop first)
DROP POLICY IF EXISTS "Users can manage their own entries" ON public.calendar_entries;

CREATE POLICY "Users can manage their own entries"
ON public.calendar_entries
FOR ALL
USING (auth.uid() = user_id);

-- 5. Create entry_statuses table if not exists
CREATE TABLE IF NOT EXISTS public.entry_statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID NOT NULL REFERENCES public.calendar_entries(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'INCOMPLETE')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(entry_id, date)
);

-- 6. Enable RLS on entry_statuses
ALTER TABLE public.entry_statuses ENABLE ROW LEVEL SECURITY;

-- 7. Create Policy for entry_statuses (safely drop first)
DROP POLICY IF EXISTS "Users can manage their own entry statuses" ON public.entry_statuses;

CREATE POLICY "Users can manage their own entry statuses"
ON public.entry_statuses
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.calendar_entries
        WHERE public.calendar_entries.id = entry_statuses.entry_id
        AND public.calendar_entries.user_id = auth.uid()
    )
);
