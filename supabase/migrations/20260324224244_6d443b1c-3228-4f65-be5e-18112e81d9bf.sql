
CREATE TABLE public.astral_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.astral_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own extras" ON public.astral_extras FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own extras" ON public.astral_extras FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own extras" ON public.astral_extras FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_astral_extras_user_type ON public.astral_extras (user_id, type);
