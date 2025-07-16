-- פונקציה לעדכון מונה השימושים של קוד הרשמה
CREATE OR REPLACE FUNCTION public.increment_registration_code_usage(code_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.business_registration_codes 
  SET usage_count = usage_count + 1
  WHERE code = code_param;
END;
$$;