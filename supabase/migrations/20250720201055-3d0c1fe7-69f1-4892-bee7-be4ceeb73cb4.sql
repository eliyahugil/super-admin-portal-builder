-- Add policy for anonymous access to employees table for login
CREATE POLICY "Anonymous users can read employees for login"
ON public.employees
FOR SELECT
USING (true);

-- Add policy for service role to access employees
CREATE POLICY "Service role can access employees"
ON public.employees
FOR ALL
USING (true)
WITH CHECK (true);