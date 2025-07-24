-- Remove all existing shift submission tokens
DELETE FROM public.shift_submission_tokens;

-- Create individual employee weekly tokens table
CREATE TABLE IF NOT EXISTS public.employee_weekly_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  max_submissions INTEGER DEFAULT NULL,
  current_submissions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_weekly_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for employee weekly tokens
CREATE POLICY "Business users can manage employee weekly tokens"
ON public.employee_weekly_tokens
FOR ALL
USING (
  business_id = ANY(get_user_business_ids())
)
WITH CHECK (
  business_id = ANY(get_user_business_ids())
);

-- Public access policy for token validation
CREATE POLICY "Public access to employee weekly tokens for validation"
ON public.employee_weekly_tokens
FOR SELECT
USING (
  is_active = true AND expires_at > now()
);

-- Service role access
CREATE POLICY "Service role can access employee weekly tokens"
ON public.employee_weekly_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to generate or update employee weekly token
CREATE OR REPLACE FUNCTION public.generate_employee_weekly_token(
  p_employee_id UUID,
  p_week_start_date DATE,
  p_week_end_date DATE
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business_id UUID;
  v_token TEXT;
  v_existing_token TEXT;
BEGIN
  -- Get business_id from employee
  SELECT business_id INTO v_business_id
  FROM public.employees
  WHERE id = p_employee_id;
  
  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Employee not found';
  END IF;
  
  -- Check if token already exists for this employee and week
  SELECT token INTO v_existing_token
  FROM public.employee_weekly_tokens
  WHERE employee_id = p_employee_id
    AND week_start_date = p_week_start_date
    AND week_end_date = p_week_end_date;
  
  IF v_existing_token IS NOT NULL THEN
    -- Update existing token to be active
    UPDATE public.employee_weekly_tokens
    SET is_active = true,
        expires_at = now() + interval '30 days',
        updated_at = now()
    WHERE employee_id = p_employee_id
      AND week_start_date = p_week_start_date
      AND week_end_date = p_week_end_date;
    
    RETURN v_existing_token;
  END IF;
  
  -- Generate new token
  v_token := encode(gen_random_bytes(32), 'base64');
  v_token := replace(replace(replace(v_token, '/', '_'), '+', '-'), '=', '');
  
  -- Insert new token
  INSERT INTO public.employee_weekly_tokens (
    employee_id,
    business_id,
    token,
    week_start_date,
    week_end_date,
    is_active,
    expires_at
  ) VALUES (
    p_employee_id,
    v_business_id,
    v_token,
    p_week_start_date,
    p_week_end_date,
    true,
    now() + interval '30 days'
  );
  
  RETURN v_token;
END;
$$;

-- Create trigger for updating updated_at
CREATE TRIGGER update_employee_weekly_tokens_updated_at
  BEFORE UPDATE ON public.employee_weekly_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_weekly_tokens_employee_id ON public.employee_weekly_tokens(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_weekly_tokens_business_id ON public.employee_weekly_tokens(business_id);
CREATE INDEX IF NOT EXISTS idx_employee_weekly_tokens_token ON public.employee_weekly_tokens(token);
CREATE INDEX IF NOT EXISTS idx_employee_weekly_tokens_week_dates ON public.employee_weekly_tokens(week_start_date, week_end_date);