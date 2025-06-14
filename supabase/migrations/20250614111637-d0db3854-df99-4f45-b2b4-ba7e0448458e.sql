
-- יצירת טבלה לתוכניות מנוי
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'intermediate', 'full')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'trial')),
  duration_months INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלה להרשאות מודולים לפי תוכנית
CREATE TABLE public.plan_module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_included BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER, -- הגבלת שימוש (אם רלוונטי)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלה למנויי עסקים
CREATE TABLE public.business_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלה להרשאות מודולים ספציפיות לעסק
CREATE TABLE public.business_module_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  subscription_id UUID REFERENCES public.business_subscriptions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, module_key, subscription_id)
);

-- הוספת RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_module_subscriptions ENABLE ROW LEVEL SECURITY;

-- מדיניות RLS לתוכניות מנוי - רק סופר אדמין יכול לנהל
CREATE POLICY "Super admin can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- מדיניות RLS להרשאות מודולים לפי תוכנית
CREATE POLICY "Super admin can manage plan module permissions" 
ON public.plan_module_permissions 
FOR ALL 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- מדיניות RLS למנויי עסקים
CREATE POLICY "Super admin and business owners can view business subscriptions" 
ON public.business_subscriptions 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Super admin can insert business subscriptions" 
ON public.business_subscriptions 
FOR INSERT
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Super admin can update business subscriptions" 
ON public.business_subscriptions 
FOR UPDATE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Super admin can delete business subscriptions" 
ON public.business_subscriptions 
FOR DELETE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- מדיניות RLS להרשאות מודולים ספציפיות לעסק
CREATE POLICY "Super admin and business owners can view business module subscriptions" 
ON public.business_module_subscriptions 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Super admin can insert business module subscriptions" 
ON public.business_module_subscriptions 
FOR INSERT
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Super admin can update business module subscriptions" 
ON public.business_module_subscriptions 
FOR UPDATE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Super admin can delete business module subscriptions" 
ON public.business_module_subscriptions 
FOR DELETE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- הכנסת תוכניות מנוי בסיסיות
INSERT INTO public.subscription_plans (name, description, plan_type, billing_cycle, duration_months) VALUES
('תוכנית בסיסית - חודשית', 'גישה למודולים בסיסיים', 'basic', 'monthly', 1),
('תוכנית בסיסית - שנתית', 'גישה למודולים בסיסיים', 'basic', 'yearly', 12),
('תוכנית בינונית - חודשית', 'גישה לרוב המודולים', 'intermediate', 'monthly', 1),
('תוכנית בינונית - שנתית', 'גישה לרוב המודולים', 'intermediate', 'yearly', 12),
('תוכנית מלאה - חודשית', 'גישה לכל המודולים', 'full', 'monthly', 1),
('תוכנית מלאה - שנתית', 'גישה לכל המודולים', 'full', 'yearly', 12),
('תקופת ניסיון', 'גישה מוגבלת לתקופת ניסיון', 'basic', 'trial', NULL);

-- פונקציה לבדיקת הרשאת מודול לעסק
CREATE OR REPLACE FUNCTION public.check_business_module_access(
  business_id_param UUID,
  module_key_param TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.business_module_subscriptions bms
    WHERE bms.business_id = business_id_param
      AND bms.module_key = module_key_param
      AND bms.is_active = true
      AND (bms.end_date IS NULL OR bms.end_date >= CURRENT_DATE)
      AND bms.start_date <= CURRENT_DATE
  );
$$;
