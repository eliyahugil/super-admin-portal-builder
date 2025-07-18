-- Fix the get_user_business_ids function for super_admin
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
 RETURNS uuid[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      ARRAY(SELECT id FROM public.businesses WHERE is_active = true)
    ELSE
      ARRAY(
        SELECT DISTINCT business_id 
        FROM public.user_businesses 
        WHERE user_id = auth.uid()
        UNION
        SELECT business_id 
        FROM public.profiles 
        WHERE id = auth.uid() AND business_id IS NOT NULL
      )
  END;
$function$;