ALTER TABLE public.astral_charts
  ADD COLUMN IF NOT EXISTS birth_timezone text,
  ADD COLUMN IF NOT EXISTS birth_utc text;