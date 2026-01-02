-- Create frequency enum
CREATE TYPE public.entry_frequency AS ENUM ('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', '3_MONTHLY', '6_MONTHLY', 'YEARLY');

-- Create calendar_entries table
CREATE TABLE public.calendar_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  frequency entry_frequency NOT NULL,
  description TEXT,
  amount DECIMAL(10,2),
  is_paused BOOLEAN DEFAULT FALSE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data isolation
CREATE POLICY "Users can view their own entries"
ON public.calendar_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
ON public.calendar_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
ON public.calendar_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
ON public.calendar_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_calendar_entries_user_date ON public.calendar_entries(user_id, date);
CREATE INDEX idx_calendar_entries_frequency ON public.calendar_entries(frequency);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendar_entries_updated_at
BEFORE UPDATE ON public.calendar_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();