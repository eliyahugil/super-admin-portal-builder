-- Add a policy to allow all authenticated users to read global integrations
CREATE POLICY "Authenticated users can view global integrations"
ON public.global_integrations
FOR SELECT
TO public
USING (true);