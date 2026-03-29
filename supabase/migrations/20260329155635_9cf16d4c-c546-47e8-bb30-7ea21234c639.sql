CREATE OR REPLACE FUNCTION public.increment_reading_count(p_user_id uuid, p_date date, p_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Always use the authenticated user's ID, ignore client-supplied p_user_id
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate p_type to prevent SQL injection via dynamic column name
  IF p_type NOT IN ('tarot', 'secret', 'angels', 'oracle') THEN
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
$$;