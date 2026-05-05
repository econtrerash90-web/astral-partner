-- Trigger-only functions: should not be exposed via API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_astral_chart() FROM PUBLIC, anon, authenticated;

-- RPC used by clients: only authenticated, never anon
REVOKE ALL ON FUNCTION public.increment_reading_count(uuid, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_reading_count(uuid, date, text) TO authenticated;