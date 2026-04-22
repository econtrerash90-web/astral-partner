-- Enable scheduling extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Audit run summary
CREATE TABLE public.chart_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  total_charts integer NOT NULL DEFAULT 0,
  total_mismatches integer NOT NULL DEFAULT 0,
  notes text
);

ALTER TABLE public.chart_audit_runs ENABLE ROW LEVEL SECURITY;

-- No public policies: only service_role (which bypasses RLS) can access.

-- Per-field discrepancy log
CREATE TABLE public.chart_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.chart_audit_runs(id) ON DELETE CASCADE,
  chart_id uuid NOT NULL,
  user_id uuid NOT NULL,
  field_name text NOT NULL CHECK (field_name IN (
    'sun_sign_name','sun_sign_element','sun_sign_planet','sun_sign_symbol',
    'moon_sign','ascendant'
  )),
  stored_value text,
  expected_value text,
  status text NOT NULL CHECK (status IN ('ok','mismatch')),
  audited_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chart_audit_log_run ON public.chart_audit_log(run_id);
CREATE INDEX idx_chart_audit_log_status ON public.chart_audit_log(status);
CREATE INDEX idx_chart_audit_log_chart ON public.chart_audit_log(chart_id);

ALTER TABLE public.chart_audit_log ENABLE ROW LEVEL SECURITY;
-- No public policies: only service_role can access.