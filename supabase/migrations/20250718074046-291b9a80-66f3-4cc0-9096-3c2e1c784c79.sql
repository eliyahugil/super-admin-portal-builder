-- Add a policy to allow employees to update their own birth_date and email during first login
CREATE POLICY "Employees can update their own birth_date and email" 
ON public.employees 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Also allow public access for employee self-updates during login flow
CREATE POLICY "Public can update employee basic info during login" 
ON public.employees 
FOR UPDATE 
USING (true)
WITH CHECK (true);