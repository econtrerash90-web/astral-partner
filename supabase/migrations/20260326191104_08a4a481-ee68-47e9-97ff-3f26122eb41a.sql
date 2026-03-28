CREATE TABLE public.daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reading_date DATE NOT NULL,
  reading_type TEXT NOT NULL DEFAULT 'horoscope',
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reading_date, reading_type)
);

ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own readings" ON public.daily_readings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings" ON public.daily_readings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings" ON public.daily_readings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);