-- Invalidate AI-generated cached content for the authenticated user
CREATE OR REPLACE FUNCTION public.invalidate_user_ai_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.daily_readings WHERE user_id = v_user_id;
  DELETE FROM public.weekly_predictions WHERE user_id = v_user_id;
  DELETE FROM public.astral_extras WHERE user_id = v_user_id;
  UPDATE public.astral_charts SET analysis = NULL, updated_at = now()
    WHERE user_id = v_user_id;
END;
$$;