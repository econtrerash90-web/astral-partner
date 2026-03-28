
-- Daily limits table for tracking freemium usage
CREATE TABLE public.daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  limit_date DATE NOT NULL,
  tarot_count INTEGER NOT NULL DEFAULT 0,
  secret_count INTEGER NOT NULL DEFAULT 0,
  angels_count INTEGER NOT NULL DEFAULT 0,
  oracle_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, limit_date)
);

ALTER TABLE public.daily_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own limits" ON public.daily_limits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own limits" ON public.daily_limits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own limits" ON public.daily_limits FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add unique constraint on daily_readings for upsert support
-- Already has a unique on user_id, reading_date, reading_type from prior migration

-- Function to increment reading count atomically
CREATE OR REPLACE FUNCTION public.increment_reading_count(p_user_id UUID, p_date DATE, p_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_limits (user_id, limit_date)
  VALUES (p_user_id, p_date)
  ON CONFLICT (user_id, limit_date) DO NOTHING;

  EXECUTE format(
    'UPDATE public.daily_limits SET %I = %I + 1 WHERE user_id = $1 AND limit_date = $2',
    p_type || '_count', p_type || '_count'
  ) USING p_user_id, p_date;
END;
$$;
