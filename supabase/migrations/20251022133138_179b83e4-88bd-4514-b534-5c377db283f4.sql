-- Update RLS to allow super admins to manage all raw materials as well
DROP POLICY IF EXISTS "Business users can manage raw materials" ON public.raw_materials;

-- Ensure RLS is enabled
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create combined policy for business users and super admins
CREATE POLICY "Business users and super admins can manage raw materials"
ON public.raw_materials
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