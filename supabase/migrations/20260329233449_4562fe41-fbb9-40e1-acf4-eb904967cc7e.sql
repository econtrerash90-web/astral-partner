
-- Function to calculate zodiac sign from month and day
CREATE OR REPLACE FUNCTION public.calculate_zodiac_sign(p_month int, p_day int)
RETURNS TABLE(sign_name text, sign_element text, sign_planet text, sign_symbol text)
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  -- Capricornio
  IF (p_month = 12 AND p_day >= 22) OR (p_month = 1 AND p_day <= 19) THEN
    RETURN QUERY SELECT 'Capricornio'::text, 'Tierra'::text, 'Saturno'::text, '♑'::text;
  ELSIF p_month = 1 AND p_day >= 20 OR p_month = 2 AND p_day <= 18 THEN
    RETURN QUERY SELECT 'Acuario'::text, 'Aire'::text, 'Urano'::text, '♒'::text;
  ELSIF (p_month = 2 AND p_day >= 19) OR (p_month = 3 AND p_day <= 20) THEN
    RETURN QUERY SELECT 'Piscis'::text, 'Agua'::text, 'Neptuno'::text, '♓'::text;
  ELSIF (p_month = 3 AND p_day >= 21) OR (p_month = 4 AND p_day <= 19) THEN
    RETURN QUERY SELECT 'Aries'::text, 'Fuego'::text, 'Marte'::text, '♈'::text;
  ELSIF (p_month = 4 AND p_day >= 20) OR (p_month = 5 AND p_day <= 20) THEN
    RETURN QUERY SELECT 'Tauro'::text, 'Tierra'::text, 'Venus'::text, '♉'::text;
  ELSIF (p_month = 5 AND p_day >= 21) OR (p_month = 6 AND p_day <= 20) THEN
    RETURN QUERY SELECT 'Géminis'::text, 'Aire'::text, 'Mercurio'::text, '♊'::text;
  ELSIF (p_month = 6 AND p_day >= 21) OR (p_month = 7 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Cáncer'::text, 'Agua'::text, 'Luna'::text, '♋'::text;
  ELSIF (p_month = 7 AND p_day >= 23) OR (p_month = 8 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Leo'::text, 'Fuego'::text, 'Sol'::text, '♌'::text;
  ELSIF (p_month = 8 AND p_day >= 23) OR (p_month = 9 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Virgo'::text, 'Tierra'::text, 'Mercurio'::text, '♍'::text;
  ELSIF (p_month = 9 AND p_day >= 23) OR (p_month = 10 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Libra'::text, 'Aire'::text, 'Venus'::text, '♎'::text;
  ELSIF (p_month = 10 AND p_day >= 23) OR (p_month = 11 AND p_day <= 21) THEN
    RETURN QUERY SELECT 'Escorpio'::text, 'Agua'::text, 'Plutón'::text, '♏'::text;
  ELSE
    RETURN QUERY SELECT 'Sagitario'::text, 'Fuego'::text, 'Júpiter'::text, '♐'::text;
  END IF;
END;
$$;

-- Function to calculate moon sign from birth date (day of year based)
CREATE OR REPLACE FUNCTION public.calculate_moon_sign(p_birth_date date)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_day_of_year int;
  v_index int;
  v_signs text[] := ARRAY['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
BEGIN
  v_day_of_year := EXTRACT(DOY FROM p_birth_date)::int;
  v_index := (FLOOR((v_day_of_year * 12)::numeric / 365) % 12)::int;
  RETURN v_signs[v_index + 1]; -- PG arrays are 1-based
END;
$$;

-- Function to calculate ascendant from birth hour
CREATE OR REPLACE FUNCTION public.calculate_ascendant(p_hour int)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_index int;
  v_signs text[] := ARRAY['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
BEGIN
  v_index := (FLOOR((p_hour * 60)::numeric / 120) % 12)::int;
  RETURN v_signs[v_index + 1];
END;
$$;

-- Trigger function: recalculate astral values when birth data changes + clear stale readings
CREATE OR REPLACE FUNCTION public.recalculate_astral_chart()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_date date;
  v_hour int;
  v_month int;
  v_day int;
  v_zodiac record;
BEGIN
  -- Only recalculate if birth_date or birth_time actually changed
  IF OLD.birth_date = NEW.birth_date AND OLD.birth_time = NEW.birth_time THEN
    RETURN NEW;
  END IF;

  -- Parse birth_date (stored as text 'YYYY-MM-DD')
  v_date := NEW.birth_date::date;
  v_month := EXTRACT(MONTH FROM v_date)::int;
  v_day := EXTRACT(DAY FROM v_date)::int;

  -- Parse birth_time (stored as text 'HH:MM')
  v_hour := SPLIT_PART(NEW.birth_time, ':', 1)::int;

  -- Calculate zodiac sign
  SELECT * INTO v_zodiac FROM public.calculate_zodiac_sign(v_month, v_day);

  -- Update the NEW record with recalculated values
  NEW.sun_sign_name := v_zodiac.sign_name;
  NEW.sun_sign_element := v_zodiac.sign_element;
  NEW.sun_sign_planet := v_zodiac.sign_planet;
  NEW.sun_sign_symbol := v_zodiac.sign_symbol;
  NEW.moon_sign := public.calculate_moon_sign(v_date);
  NEW.ascendant := public.calculate_ascendant(v_hour);
  NEW.updated_at := now();

  -- Clear stale daily readings (horoscopes based on old chart)
  DELETE FROM public.daily_readings
  WHERE user_id = NEW.user_id
    AND reading_date = CURRENT_DATE;

  -- Clear today's daily limits so user can get fresh readings
  DELETE FROM public.daily_limits
  WHERE user_id = NEW.user_id
    AND limit_date = CURRENT_DATE;

  -- Clear stale weekly predictions
  DELETE FROM public.weekly_predictions
  WHERE user_id = NEW.user_id
    AND week_end::date >= CURRENT_DATE;

  -- Clear stale extras (lucky number, ritual, amulet)
  DELETE FROM public.astral_extras
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create the trigger on astral_charts
DROP TRIGGER IF EXISTS trg_recalculate_astral_chart ON public.astral_charts;
CREATE TRIGGER trg_recalculate_astral_chart
  BEFORE UPDATE ON public.astral_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_astral_chart();
