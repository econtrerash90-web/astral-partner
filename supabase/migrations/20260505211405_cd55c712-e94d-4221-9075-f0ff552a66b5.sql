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
  -- Recalculate when birth_date, birth_time OR birth_place changes
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

  -- Clear stale daily readings for today
  DELETE FROM public.daily_readings
  WHERE user_id = NEW.user_id
    AND reading_date = CURRENT_DATE;

  -- Reset today's daily limits
  DELETE FROM public.daily_limits
  WHERE user_id = NEW.user_id
    AND limit_date = CURRENT_DATE;

  -- Clear stale weekly predictions
  DELETE FROM public.weekly_predictions
  WHERE user_id = NEW.user_id
    AND week_end::date >= CURRENT_DATE;

  -- Clear stale extras (lucky number, ritual, amulet, natalChart cache)
  DELETE FROM public.astral_extras
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$function$;