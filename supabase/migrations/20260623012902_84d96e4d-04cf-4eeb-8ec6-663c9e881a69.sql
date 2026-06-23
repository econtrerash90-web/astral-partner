UPDATE public.astral_charts SET analysis = NULL, updated_at = now() WHERE user_id = 'a3e293f9-30d4-4fc5-b863-42d1e5dbc25d';
DELETE FROM public.daily_readings WHERE user_id = 'a3e293f9-30d4-4fc5-b863-42d1e5dbc25d';
DELETE FROM public.weekly_predictions WHERE user_id = 'a3e293f9-30d4-4fc5-b863-42d1e5dbc25d';
DELETE FROM public.astral_extras WHERE user_id = 'a3e293f9-30d4-4fc5-b863-42d1e5dbc25d';