
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can create shift templates for their business" ON public.shift_templates;
DROP POLICY IF EXISTS "Users can view shift templates for their business" ON public.shift_templates;
DROP POLICY IF EXISTS "Users can update shift templates for their business" ON public.shift_templates;
DROP POLICY IF EXISTS "Users can delete shift templates for their business" ON public.shift_templates;

-- Create more permissive policies that check through profiles table
CREATE POLICY "Users can create shift templates for their business"
ON public.shift_templates
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
);

CREATE POLICY "Users can view shift templates for their business"
ON public.shift_templates
FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
);

CREATE POLICY "Users can update shift templates for their business"
ON public.shift_templates
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
);

CREATE POLICY "Users can delete shift templates for their business"
ON public.shift_templates
FOR DELETE
USING (
  business_id IN (
    SELECT business_id FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
);
