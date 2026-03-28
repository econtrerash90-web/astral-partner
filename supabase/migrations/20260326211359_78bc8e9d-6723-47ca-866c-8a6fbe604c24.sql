
CREATE TABLE public.important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_icon TEXT DEFAULT '✨',
  event_date DATE NOT NULL,
  event_time TIME,
  event_latitude DECIMAL(10, 8),
  event_longitude DECIMAL(11, 8),
  event_timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_important_dates_user ON public.important_dates(user_id);

ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dates"
  ON public.important_dates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dates"
  ON public.important_dates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dates"
  ON public.important_dates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own dates"
  ON public.important_dates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
