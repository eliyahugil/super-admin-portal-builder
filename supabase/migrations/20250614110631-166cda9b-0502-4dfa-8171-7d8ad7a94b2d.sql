
-- יצירת טבלה לבקשות גישה
CREATE TABLE IF NOT EXISTS public.user_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  requested_role user_role NOT NULL DEFAULT 'business_user',
  request_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- הוספת RLS
ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;

-- מדיניות לצפייה - רק סופר אדמין יכול לראות הכל, משתמשים רגילים רק את הבקשות שלהם
CREATE POLICY "Super admin can view all access requests" 
ON public.user_access_requests 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR user_id = auth.uid()
);

-- מדיניות ליצירה - משתמשים יכולים ליצור בקשות רק עבור עצמם
CREATE POLICY "Users can create their own access requests" 
ON public.user_access_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- מדיניות לעדכון - רק סופר אדמין יכול לעדכן סטטוס
CREATE POLICY "Super admin can update access requests" 
ON public.user_access_requests 
FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- עדכון הטריגר כדי לאפשר הרשמה רגילה
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Add a small delay to ensure user data is fully committed
  PERFORM pg_sleep(0.1);
  
  INSERT INTO public.profiles (id, email, full_name, role, business_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    CASE 
      -- רק המשתמש הספציפי הזה יקבל super_admin
      WHEN new.email = 'eligil1308@gmail.com' THEN 'super_admin'::user_role
      -- כל שאר המשתמשים יהיו business_user ללא עסק מוקצה
      ELSE 'business_user'::user_role
    END,
    -- משתמשים חדשים לא יקושרו לעסק עד שיקבלו הרשאה
    NULL
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Still try to create a basic profile
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, role, business_id)
      VALUES (new.id, new.email, '', 'business_user'::user_role, NULL);
    EXCEPTION
      WHEN OTHERS THEN
        -- If this also fails, just log and continue
        RAISE LOG 'Failed to create fallback profile: %', SQLERRM;
    END;
    RETURN new;
END;
$function$;
