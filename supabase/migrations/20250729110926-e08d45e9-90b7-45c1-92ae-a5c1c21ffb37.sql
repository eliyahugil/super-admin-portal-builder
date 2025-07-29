-- תיקון בעיות search_path בפונקציות - חלק 1
-- מתקן את הפונקציות הבעייתיות שזוהו בליקויי האבטחה

-- תיקון פונקציית update_updated_at_accounting
CREATE OR REPLACE FUNCTION public.update_updated_at_accounting()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- תיקון פונקציית get_user_business_ids
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

-- תיקון פונקציית get_current_business_id
CREATE OR REPLACE FUNCTION public.get_current_business_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      NULL::uuid
    ELSE
      COALESCE(
        (SELECT business_id FROM public.profiles WHERE id = auth.uid()),
        (SELECT business_id FROM public.user_businesses WHERE user_id = auth.uid() LIMIT 1)
      )
  END;
$function$;