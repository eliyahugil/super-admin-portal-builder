-- Fix RLS for production_batches table
DROP POLICY IF EXISTS "Users can manage batches in their business" ON public.production_batches;
DROP POLICY IF EXISTS "Business admins can manage batches" ON public.production_batches;

-- Ensure RLS is enabled
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

-- Create unified policy for business users and super admins
CREATE POLICY "production_batches_access_policy"
ON public.production_batches
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