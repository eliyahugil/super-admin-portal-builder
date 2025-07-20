-- Add policy for anonymous access to employees table for login
DROP POLICY IF EXISTS "Anonymous users can read employees for login" ON public.employees;

CREATE POLICY "Anonymous users can read employees for login"
ON public.employees
FOR SELECT
TO anon
USING (true);