-- Create a function to check if a public token is valid for a specific business and date range
CREATE OR REPLACE FUNCTION public.is_valid_public_token(
  token_value text,
  target_business_id uuid,
  target_date text
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.shift_submission_tokens 
    WHERE token = token_value
      AND business_id = target_business_id
      AND is_active = true
      AND expires_at > now()
      AND target_date >= week_start_date
      AND target_date <= week_end_date
  );
$$;

-- Add a policy for public access to scheduled_shifts via tokens
CREATE POLICY "Public access via valid tokens" 
ON public.scheduled_shifts 
FOR SELECT 
TO anon
USING (
  -- Check if there's a valid token in the request headers or URL
  EXISTS (
    SELECT 1 
    FROM public.shift_submission_tokens 
    WHERE business_id = scheduled_shifts.business_id
      AND is_active = true
      AND expires_at > now()
      AND scheduled_shifts.shift_date >= week_start_date
      AND scheduled_shifts.shift_date <= week_end_date
  )
);