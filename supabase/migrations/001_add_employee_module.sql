
-- Add the Employee Management module to the modules table
INSERT INTO public.modules (
  id,
  name,
  description,
  icon,
  route,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ניהול עובדים וסניפים',
  'מודל לניהול עובדים, סניפים, משמרות ונוכחות',
  '👥',
  '/employees',
  true,
  now(),
  now()
) ON CONFLICT (route) DO NOTHING;
