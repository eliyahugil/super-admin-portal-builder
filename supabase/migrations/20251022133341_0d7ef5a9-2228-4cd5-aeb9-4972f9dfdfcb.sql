-- Fix RLS for raw_material_receipts table
DROP POLICY IF EXISTS "Users can manage raw material receipts" ON public.raw_material_receipts;
DROP POLICY IF EXISTS "Business users can manage raw material receipts" ON public.raw_material_receipts;

-- Ensure RLS is enabled
ALTER TABLE public.raw_material_receipts ENABLE ROW LEVEL SECURITY;

-- Create unified policy for business users and super admins
CREATE POLICY "raw_material_receipts_access_policy"
ON public.raw_material_receipts
FOR ALL
USING (
  business_id = ANY (public.get_user_business_ids())
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
)
WITH CHECK (
  business_id = ANY (public.get_user_business_ids())
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);