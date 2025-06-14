
-- נוסיף מדיניות RLS לטבלת הסניפים כדי לאפשר יצירה ועדכון
-- תחילה ניצור פונקציה בטוחה לבדיקת הרשאות

CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS uuid[] 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
AS $$
  -- עבור super admin - החזר את כל העסקים
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      ARRAY(SELECT id FROM public.businesses WHERE is_active = true)
    ELSE
      -- עבור משתמשים רגילים - החזר רק את העסקים שלהם
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
$$;

-- אפשר RLS על טבלת הסניפים
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- מדיניות לצפייה בסניפים
CREATE POLICY "Users can view branches of their businesses" ON public.branches
FOR SELECT USING (
  business_id = ANY(public.get_user_business_ids())
);

-- מדיניות ליצירת סניפים
CREATE POLICY "Users can create branches for their businesses" ON public.branches
FOR INSERT WITH CHECK (
  business_id = ANY(public.get_user_business_ids())
);

-- מדיניות לעדכון סניפים
CREATE POLICY "Users can update branches of their businesses" ON public.branches
FOR UPDATE USING (
  business_id = ANY(public.get_user_business_ids())
) WITH CHECK (
  business_id = ANY(public.get_user_business_ids())
);

-- מדיניות למחיקת סניפים
CREATE POLICY "Users can delete branches of their businesses" ON public.branches
FOR DELETE USING (
  business_id = ANY(public.get_user_business_ids())
);

-- נוסיף גם מדיניות דומה לטבלת תבניות המשמרות
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shift templates of their businesses" ON public.shift_templates
FOR SELECT USING (
  business_id = ANY(public.get_user_business_ids())
);

CREATE POLICY "Users can create shift templates for their businesses" ON public.shift_templates
FOR INSERT WITH CHECK (
  business_id = ANY(public.get_user_business_ids())
);

CREATE POLICY "Users can update shift templates of their businesses" ON public.shift_templates
FOR UPDATE USING (
  business_id = ANY(public.get_user_business_ids())
) WITH CHECK (
  business_id = ANY(public.get_user_business_ids())
);

CREATE POLICY "Users can delete shift templates of their businesses" ON public.shift_templates
FOR DELETE USING (
  business_id = ANY(public.get_user_business_ids())
);
