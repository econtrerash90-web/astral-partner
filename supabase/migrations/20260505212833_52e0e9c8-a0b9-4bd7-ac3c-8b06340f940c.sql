-- chart_audit_log: deny all access to anon and authenticated; service role bypasses RLS
CREATE POLICY "No client access to audit log"
ON public.chart_audit_log
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- chart_audit_runs: same restriction
CREATE POLICY "No client access to audit runs"
ON public.chart_audit_runs
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);