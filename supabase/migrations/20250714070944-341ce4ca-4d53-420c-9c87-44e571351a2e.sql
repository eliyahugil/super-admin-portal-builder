-- Fix RLS policies for whatsapp_contacts
DROP POLICY IF EXISTS "Users can manage contacts for their business" ON public.whatsapp_contacts;

CREATE POLICY "Users can manage whatsapp contacts" 
ON public.whatsapp_contacts 
FOR ALL 
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL)
)
WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL)
);

-- Fix RLS policies for whatsapp_messages
DROP POLICY IF EXISTS "Users can manage messages for their business" ON public.whatsapp_messages;

CREATE POLICY "Users can manage whatsapp messages" 
ON public.whatsapp_messages 
FOR ALL 
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL)
)
WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  OR
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL)
);