-- 1. dream_entries table
CREATE TABLE public.dream_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  dream_text text NOT NULL,
  interpretation text NOT NULL,
  symbols text[] DEFAULT '{}'::text[],
  mood text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dreams"
  ON public.dream_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams"
  ON public.dream_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams"
  ON public.dream_entries FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams"
  ON public.dream_entries FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_dream_entries_user_created ON public.dream_entries(user_id, created_at DESC);

-- 2. Add dream_count to daily_limits
ALTER TABLE public.daily_limits
  ADD COLUMN IF NOT EXISTS dream_count integer NOT NULL DEFAULT 0;

-- 3. Update increment_reading_count to support 'dream'
CREATE OR REPLACE FUNCTION public.increment_reading_count(p_user_id uuid, p_date date, p_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_type NOT IN ('tarot', 'secret', 'angels', 'oracle', 'dream') THEN
    RAISE EXCEPTION 'Invalid reading type: %', p_type;
  END IF;

  INSERT INTO public.daily_limits (user_id, limit_date)
  VALUES (v_user_id, p_date)
  ON CONFLICT (user_id, limit_date) DO NOTHING;

  EXECUTE format(
    'UPDATE public.daily_limits SET %I = %I + 1 WHERE user_id = $1 AND limit_date = $2',
    p_type || '_count', p_type || '_count'
  ) USING v_user_id, p_date;
END;
$function$;

-- 4. Update recalculate_astral_chart to also clear dreams
CREATE OR REPLACE FUNCTION public.recalculate_astral_chart()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_date date;
  v_hour int;
  v_month int;
  v_day int;
  v_zodiac record;
BEGIN
  IF OLD.birth_date = NEW.birth_date
     AND OLD.birth_time = NEW.birth_time
     AND OLD.birth_place IS NOT DISTINCT FROM NEW.birth_place THEN
    RETURN NEW;
  END IF;

  v_date := NEW.birth_date::date;
  v_month := EXTRACT(MONTH FROM v_date)::int;
  v_day := EXTRACT(DAY FROM v_date)::int;
  v_hour := SPLIT_PART(NEW.birth_time, ':', 1)::int;

  SELECT * INTO v_zodiac FROM public.calculate_zodiac_sign(v_month, v_day);

  NEW.sun_sign_name := v_zodiac.sign_name;
  NEW.sun_sign_element := v_zodiac.sign_element;
  NEW.sun_sign_planet := v_zodiac.sign_planet;
  NEW.sun_sign_symbol := v_zodiac.sign_symbol;
  NEW.moon_sign := public.calculate_moon_sign(v_date);
  NEW.ascendant := public.calculate_ascendant(v_hour);
  NEW.analysis := NULL;
  NEW.updated_at := now();

  DELETE FROM public.daily_readings
  WHERE user_id = NEW.user_id AND reading_date = CURRENT_DATE;

  DELETE FROM public.daily_limits
  WHERE user_id = NEW.user_id AND limit_date = CURRENT_DATE;

  DELETE FROM public.weekly_predictions
  WHERE user_id = NEW.user_id AND week_end::date >= CURRENT_DATE;

  DELETE FROM public.astral_extras
  WHERE user_id = NEW.user_id;

  DELETE FROM public.dream_entries
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$function$;