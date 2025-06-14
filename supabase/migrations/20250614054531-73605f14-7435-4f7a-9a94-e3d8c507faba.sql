
-- Enable RLS on shift_templates table if not already enabled
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert shift templates for their business
CREATE POLICY "Users can create shift templates for their business"
ON public.shift_templates
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  )
);

-- Create policy to allow users to select shift templates for their business
CREATE POLICY "Users can view shift templates for their business"
ON public.shift_templates
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  )
);

-- Create policy to allow users to update shift templates for their business
CREATE POLICY "Users can update shift templates for their business"
ON public.shift_templates
FOR UPDATE
USING (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  )
);

-- Create policy to allow users to delete shift templates for their business
CREATE POLICY "Users can delete shift templates for their business"
ON public.shift_templates
FOR DELETE
USING (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  )
);
