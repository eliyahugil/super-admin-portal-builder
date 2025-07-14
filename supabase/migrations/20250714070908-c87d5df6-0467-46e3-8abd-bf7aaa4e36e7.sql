-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage connections for their business" ON public.whatsapp_business_connections;

-- Create new policy that allows both business owners and super admins
CREATE POLICY "Users can manage whatsapp connections" 
ON public.whatsapp_business_connections 
FOR ALL 
USING (
  -- Business owners can access their business connections
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR
  -- Super admins can access all connections
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR
  -- Users who have business access through profiles table
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL)
)
WITH CHECK (
  -- Business owners can modify their business connections
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR
  -- Super admins can modify all connections
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR
  -- Users who have business access through profiles table
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL)
);