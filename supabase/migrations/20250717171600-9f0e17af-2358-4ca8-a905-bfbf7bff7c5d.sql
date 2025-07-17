-- Create policies to allow service role access to tables needed for weekly token validation

-- Allow service role to access scheduled_shifts
CREATE POLICY "Service role can access scheduled_shifts" 
ON public.scheduled_shifts 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow service role to access available_shifts  
CREATE POLICY "Service role can access available_shifts"
ON public.available_shifts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to access employees
CREATE POLICY "Service role can access employees"
ON public.employees
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to access businesses
CREATE POLICY "Service role can access businesses"
ON public.businesses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to access branches
CREATE POLICY "Service role can access branches"
ON public.branches
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);