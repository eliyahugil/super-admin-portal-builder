-- יצירת טבלה לקודי הרשמה לעסקים
CREATE TABLE IF NOT EXISTS public.business_registration_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  code VARCHAR(8) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER NULL -- NULL = unlimited usage
);

-- יצירת אינדקס לחיפוש מהיר לפי קוד
CREATE INDEX IF NOT EXISTS idx_business_registration_codes_code ON public.business_registration_codes(code);
CREATE INDEX IF NOT EXISTS idx_business_registration_codes_business_id ON public.business_registration_codes(business_id);

-- הוספת RLS
ALTER TABLE public.business_registration_codes ENABLE ROW LEVEL SECURITY;

-- מדיניות לצפייה - super admin יכול לראות הכל, בעלי עסקים רק את הקודים שלהם
CREATE POLICY "Super admin can view all registration codes" 
ON public.business_registration_codes 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Business owners can view their codes" 
ON public.business_registration_codes 
FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- מדיניות ליצירה - רק super admin יכול ליצור קודים
CREATE POLICY "Super admin can create registration codes" 
ON public.business_registration_codes 
FOR INSERT 
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- מדיניות לעדכון - רק super admin יכול לעדכן
CREATE POLICY "Super admin can update registration codes" 
ON public.business_registration_codes 
FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- מדיניות למחיקה - רק super admin יכול למחוק
CREATE POLICY "Super admin can delete registration codes" 
ON public.business_registration_codes 
FOR DELETE 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- עדכון טבלת בקשות הגישה להוסיף קוד הרשמה
ALTER TABLE public.user_access_requests 
ADD COLUMN IF NOT EXISTS registration_code VARCHAR(8) REFERENCES public.business_registration_codes(code);

-- פונקציה ליצירת קוד ייחודי
CREATE OR REPLACE FUNCTION public.generate_business_registration_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code_length INTEGER := 8;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := '';
    FOR i IN 1..code_length LOOP
      new_code := new_code || substr(code_chars, floor(random() * length(code_chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.business_registration_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- פונקציה לקבלת עסק לפי קוד הרשמה
CREATE OR REPLACE FUNCTION public.get_business_by_registration_code(code_param TEXT)
RETURNS TABLE(
  business_id UUID,
  business_name TEXT,
  code_is_active BOOLEAN,
  code_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as business_id,
    b.name as business_name,
    brc.is_active as code_is_active,
    (brc.is_active AND (brc.max_usage IS NULL OR brc.usage_count < brc.max_usage)) as code_valid
  FROM public.business_registration_codes brc
  JOIN public.businesses b ON b.id = brc.business_id
  WHERE brc.code = code_param;
END;
$$;