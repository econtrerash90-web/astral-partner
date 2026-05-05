REVOKE EXECUTE ON FUNCTION public.invalidate_user_ai_cache() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invalidate_user_ai_cache() TO authenticated;