-- Ensure RLS for raw_materials and allow business users via get_user_business_ids()
-- Safe drops
DROP POLICY IF EXISTS "Business users can manage raw materials" ON public.raw_materials;
DROP POLICY IF EXISTS "Users can view raw materials in their business" ON public.raw_materials;

-- Enable RLS (idempotent)
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create unified ALL policy using get_user_business_ids()
CREATE POLICY "Business users can manage raw materials"
ON public.raw_materials
FOR ALL
USING (business_id = ANY (public.get_user_business_ids()))
WITH CHECK (business_id = ANY (public.get_user_business_ids()));