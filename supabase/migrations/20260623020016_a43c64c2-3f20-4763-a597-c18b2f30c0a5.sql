
CREATE OR REPLACE FUNCTION public.recalculate_astral_chart()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_date date;
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

  SELECT * INTO v_zodiac FROM public.calculate_zodiac_sign(v_month, v_day);

  -- Sol: cálculo por mes/día sigue siendo correcto.
  NEW.sun_sign_name := v_zodiac.sign_name;
  NEW.sun_sign_element := v_zodiac.sign_element;
  NEW.sun_sign_planet := v_zodiac.sign_planet;
  NEW.sun_sign_symbol := v_zodiac.sign_symbol;

  -- Luna y Ascendente se calcularán con Swiss Ephemeris en la edge function.
  NEW.moon_sign := NULL;
  NEW.ascendant := NULL;
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

DROP FUNCTION IF EXISTS public.calculate_moon_sign(date);
DROP FUNCTION IF EXISTS public.calculate_ascendant(integer);
