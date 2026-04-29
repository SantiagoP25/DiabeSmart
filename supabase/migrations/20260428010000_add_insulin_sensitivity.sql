ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS insulin_sensitivity NUMERIC;
