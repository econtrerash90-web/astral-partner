-- Helper: Title Case en español respetando partículas
CREATE OR REPLACE FUNCTION public.title_case_es(p_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_clean text;
  v_parts text[];
  v_word text;
  v_lower text;
  v_result text := '';
  v_i int;
  v_lower_words text[] := ARRAY['de','del','la','las','los','y','e','da','do','das','dos','van','von','der','den','el'];
  v_sub text[];
  v_j int;
  v_built text;
BEGIN
  IF p_input IS NULL THEN RETURN NULL; END IF;
  -- NFC normalize, collapse whitespace, trim
  v_clean := btrim(regexp_replace(normalize(p_input, NFC), '\s+', ' ', 'g'));
  IF v_clean = '' THEN RETURN ''; END IF;

  v_parts := string_to_array(lower(v_clean), ' ');
  FOR v_i IN 1 .. array_length(v_parts, 1) LOOP
    v_word := v_parts[v_i];
    IF v_i > 1 AND v_word = ANY(v_lower_words) THEN
      v_result := v_result || ' ' || v_word;
    ELSE
      -- Capitalize across hyphens/apostrophes
      v_sub := regexp_split_to_array(v_word, '([-''])');
      -- regexp_split_to_array drops the separators; rebuild with original markers
      v_built := '';
      v_j := 1;
      DECLARE
        v_chunks text[] := regexp_matches(v_word, '([^-'']+|[-''])', 'g')::text[];
      BEGIN
        NULL;
      END;
      -- simpler approach: use regexp_replace to uppercase first letter after start, hyphen or apostrophe
      v_built := regexp_replace(
        v_word,
        '(^|[-''])([[:alpha:]])',
        E'\\1' || '\u0001',  -- placeholder, fallback below
        'g'
      );
      -- Fallback simple: capitalize first char and chars after - or '
      v_built := '';
      DECLARE
        c text;
        prev text := '';
        ch text;
        k int;
      BEGIN
        FOR k IN 1 .. length(v_word) LOOP
          ch := substr(v_word, k, 1);
          IF k = 1 OR prev = '-' OR prev = '''' THEN
            v_built := v_built || upper(ch);
          ELSE
            v_built := v_built || ch;
          END IF;
          prev := ch;
        END LOOP;
      END;
      IF v_i = 1 THEN
        v_result := v_built;
      ELSE
        v_result := v_result || ' ' || v_built;
      END IF;
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;

-- Trigger function: normalize fields BEFORE insert/update
CREATE OR REPLACE FUNCTION public.normalize_astral_chart_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_parts text[];
  v_city text;
  v_state text;
  v_country text;
BEGIN
  IF NEW.full_name IS NOT NULL THEN
    NEW.full_name := public.title_case_es(NEW.full_name);
  END IF;

  IF NEW.birth_place IS NOT NULL THEN
    -- Split on comma into up to 3 parts: city, state, country
    v_parts := string_to_array(NEW.birth_place, ',');
    v_city    := COALESCE(v_parts[1], '');
    v_state   := COALESCE(v_parts[2], '');
    v_country := COALESCE(v_parts[3], '');
    NEW.birth_place := public.title_case_es(v_city)
      || ', ' || public.title_case_es(v_state)
      || ', ' || public.title_case_es(v_country);
  END IF;

  IF NEW.birth_date IS NOT NULL THEN
    NEW.birth_date := btrim(NEW.birth_date);
  END IF;
  IF NEW.birth_time IS NOT NULL THEN
    NEW.birth_time := btrim(NEW.birth_time);
  END IF;

  RETURN NEW;
END;
$$;

-- Drop old normalize trigger if any, then create with name that fires before recalculate
DROP TRIGGER IF EXISTS trg_a_normalize_astral_chart ON public.astral_charts;
CREATE TRIGGER trg_a_normalize_astral_chart
BEFORE INSERT OR UPDATE ON public.astral_charts
FOR EACH ROW
EXECUTE FUNCTION public.normalize_astral_chart_fields();

-- Lock down execute privileges
REVOKE ALL ON FUNCTION public.title_case_es(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.normalize_astral_chart_fields() FROM PUBLIC, anon, authenticated;