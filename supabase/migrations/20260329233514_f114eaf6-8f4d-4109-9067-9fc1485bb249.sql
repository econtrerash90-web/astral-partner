
CREATE OR REPLACE FUNCTION public.calculate_zodiac_sign(p_month int, p_day int)
RETURNS TABLE(sign_name text, sign_element text, sign_planet text, sign_symbol text)
LANGUAGE plpgsql IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  IF (p_month = 12 AND p_day >= 22) OR (p_month = 1 AND p_day <= 19) THEN
    RETURN QUERY SELECT 'Capricornio'::text, 'Tierra'::text, 'Saturno'::text, '♑'::text;
  ELSIF (p_month = 1 AND p_day >= 20) OR (p_month = 2 AND p_day <= 18) THEN
    RETURN QUERY SELECT 'Acuario'::text, 'Aire'::text, 'Urano'::text, '♒'::text;
  ELSIF (p_month = 2 AND p_day >= 19) OR (p_month = 3 AND p_day <= 20) THEN
    RETURN QUERY SELECT 'Piscis'::text, 'Agua'::text, 'Neptuno'::text, '♓'::text;
  ELSIF (p_month = 3 AND p_day >= 21) OR (p_month = 4 AND p_day <= 19) THEN
    RETURN QUERY SELECT 'Aries'::text, 'Fuego'::text, 'Marte'::text, '♈'::text;
  ELSIF (p_month = 4 AND p_day >= 20) OR (p_month = 5 AND p_day <= 20) THEN
    RETURN QUERY SELECT 'Tauro'::text, 'Tierra'::text, 'Venus'::text, '♉'::text;
  ELSIF (p_month = 5 AND p_day >= 21) OR (p_month = 6 AND p_day <= 20) THEN
    RETURN QUERY SELECT 'Géminis'::text, 'Aire'::text, 'Mercurio'::text, '♊'::text;
  ELSIF (p_month = 6 AND p_day >= 21) OR (p_month = 7 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Cáncer'::text, 'Agua'::text, 'Luna'::text, '♋'::text;
  ELSIF (p_month = 7 AND p_day >= 23) OR (p_month = 8 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Leo'::text, 'Fuego'::text, 'Sol'::text, '♌'::text;
  ELSIF (p_month = 8 AND p_day >= 23) OR (p_month = 9 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Virgo'::text, 'Tierra'::text, 'Mercurio'::text, '♍'::text;
  ELSIF (p_month = 9 AND p_day >= 23) OR (p_month = 10 AND p_day <= 22) THEN
    RETURN QUERY SELECT 'Libra'::text, 'Aire'::text, 'Venus'::text, '♎'::text;
  ELSIF (p_month = 10 AND p_day >= 23) OR (p_month = 11 AND p_day <= 21) THEN
    RETURN QUERY SELECT 'Escorpio'::text, 'Agua'::text, 'Plutón'::text, '♏'::text;
  ELSE
    RETURN QUERY SELECT 'Sagitario'::text, 'Fuego'::text, 'Júpiter'::text, '♐'::text;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_moon_sign(p_birth_date date)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_day_of_year int;
  v_index int;
  v_signs text[] := ARRAY['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
BEGIN
  v_day_of_year := EXTRACT(DOY FROM p_birth_date)::int;
  v_index := (FLOOR((v_day_of_year * 12)::numeric / 365) % 12)::int;
  RETURN v_signs[v_index + 1];
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_ascendant(p_hour int)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_index int;
  v_signs text[] := ARRAY['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
BEGIN
  v_index := (FLOOR((p_hour * 60)::numeric / 120) % 12)::int;
  RETURN v_signs[v_index + 1];
END;
$$;
