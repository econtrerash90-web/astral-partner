
-- Profiles table (auto-created on signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Astral charts table
CREATE TABLE public.astral_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  sun_sign_name TEXT NOT NULL,
  sun_sign_element TEXT NOT NULL,
  sun_sign_planet TEXT NOT NULL,
  sun_sign_symbol TEXT NOT NULL DEFAULT '',
  moon_sign TEXT NOT NULL,
  ascendant TEXT NOT NULL,
  analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.astral_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own charts" ON public.astral_charts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own charts" ON public.astral_charts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own charts" ON public.astral_charts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own charts" ON public.astral_charts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Journal entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  mood_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entries" ON public.journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Weekly predictions table
CREATE TABLE public.weekly_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  week_end TEXT NOT NULL,
  prediction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own predictions" ON public.weekly_predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictions" ON public.weekly_predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
