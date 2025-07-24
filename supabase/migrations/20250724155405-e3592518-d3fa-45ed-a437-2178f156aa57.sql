-- Create permanent personal tokens table for employees
CREATE TABLE IF NOT EXISTS public.employee_permanent_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NULL,
  uses_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.employee_permanent_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Business users can manage permanent tokens for their employees" 
ON public.employee_permanent_tokens 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_permanent_tokens.employee_id 
  AND e.business_id = ANY (get_user_business_ids())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_permanent_tokens.employee_id 
  AND e.business_id = ANY (get_user_business_ids())
));

-- Service role access for edge functions
CREATE POLICY "Service role can access permanent tokens" 
ON public.employee_permanent_tokens 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Create function to generate permanent token for employee
CREATE OR REPLACE FUNCTION public.generate_employee_permanent_token(p_employee_id UUID)
RETURNS TEXT
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
  
  -- Check if token already exists for this employee
  SELECT token INTO v_existing_token
  FROM public.employee_permanent_tokens
  WHERE employee_id = p_employee_id
    AND is_active = true;
  
  IF v_existing_token IS NOT NULL THEN
    -- Return existing active token
    RETURN v_existing_token;
  END IF;
  
  -- Generate new unique token
  v_token := encode(gen_random_bytes(32), 'base64');
  v_token := replace(replace(replace(v_token, '/', '_'), '+', '-'), '=', '');
  
  -- Insert new permanent token
  INSERT INTO public.employee_permanent_tokens (
    employee_id,
    business_id,
    token,
    is_active
  ) VALUES (
    p_employee_id,
    v_business_id,
    v_token,
    true
  );
  
  RETURN v_token;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_permanent_tokens_employee_id 
ON public.employee_permanent_tokens(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_permanent_tokens_business_id 
ON public.employee_permanent_tokens(business_id);

CREATE INDEX IF NOT EXISTS idx_employee_permanent_tokens_token 
ON public.employee_permanent_tokens(token);

-- Trigger for updated_at
CREATE TRIGGER update_employee_permanent_tokens_updated_at
BEFORE UPDATE ON public.employee_permanent_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();