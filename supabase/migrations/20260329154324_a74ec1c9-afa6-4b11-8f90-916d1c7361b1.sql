-- 1. Add missing UPDATE policy to journal_entries
CREATE POLICY "Users can update own entries"
ON public.journal_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Remove the UPDATE policy from daily_limits to prevent counter bypass
DROP POLICY IF EXISTS "Users can update own limits" ON public.daily_limits;