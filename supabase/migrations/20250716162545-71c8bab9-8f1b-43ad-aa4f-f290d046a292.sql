-- Create a new function that respects current business context for super admins
CREATE OR REPLACE FUNCTION public.get_current_business_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  -- For super admins, we need to get the current selected business from the context
  -- This should be set by the application when switching between businesses
  -- For now, we'll use a placeholder that needs to be implemented in the application
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      -- For super admin, return null to force application-level business context
      NULL::uuid
    ELSE
      -- For regular users, return their assigned business
      COALESCE(
        (SELECT business_id FROM public.profiles WHERE id = auth.uid()),
        (SELECT business_id FROM public.user_businesses WHERE user_id = auth.uid() LIMIT 1)
      )
  END;
$function$;

-- Update the branches policy to be more restrictive for super admins
DROP POLICY "Users can view branches of their businesses" ON public.branches;

CREATE POLICY "Users can view branches of their current business" 
ON public.branches 
FOR SELECT 
USING (
  CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      -- Super admin should only see branches when explicitly working on a specific business
      -- This requires application-level business context management
      business_id IN (
        SELECT id FROM public.businesses 
        WHERE is_active = true
        -- TODO: Add application-level business context filtering here
      )
    ELSE
      -- Regular users see only their business branches
      business_id IN (
        SELECT DISTINCT business_id 
        FROM public.user_businesses 
        WHERE user_id = auth.uid()
        UNION
        SELECT business_id 
        FROM public.profiles 
        WHERE id = auth.uid() AND business_id IS NOT NULL
      )
  END
);