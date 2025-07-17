-- Add RLS policy for service role access to employee_weekly_tokens
CREATE POLICY "Service role can access employee_weekly_tokens"
ON public.employee_weekly_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Add RLS policy for service role access to employee_shift_choices
CREATE POLICY "Service role can access employee_shift_choices"
ON public.employee_shift_choices
FOR ALL
USING (true)
WITH CHECK (true);