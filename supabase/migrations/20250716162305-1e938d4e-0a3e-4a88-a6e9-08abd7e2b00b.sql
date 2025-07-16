-- Fix the security issue by removing the overly permissive policy
DROP POLICY "Users can view branches from their business" ON public.branches;

-- Keep only the secure policy that respects business isolation
-- The remaining policy "Users can view branches of their businesses" uses get_user_business_ids() 
-- which properly respects the current business context