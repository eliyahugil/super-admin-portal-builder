
-- 1. מחיקת עמודת branch_id הקיימת והחלפתה בטבלת קישור לריבוי סניפים
CREATE TABLE public.shift_template_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_template_id UUID NOT NULL REFERENCES shift_templates(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. הוספת עמודת תפקיד (role_name) לטבלת shift_templates
ALTER TABLE public.shift_templates
ADD COLUMN role_name TEXT;

-- 3. יצירת טבלה לניהול תפקידים (עם שיוך לעסק) כדי לאפשר תוספת דינמית של תפקידים
CREATE TABLE public.shift_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(business_id, name)
);

-- 4. הוספת עמודת is_archived בטבלת shift_templates
ALTER TABLE public.shift_templates
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;

-- 5. מדיניותי RLS מתאימות:
-- shift_templates – עדכון כל הפוליסות לכלול is_archived (בחרירת רק איפה צריך).
DROP POLICY IF EXISTS "Users can view shift templates for their business" ON public.shift_templates;
DROP POLICY IF EXISTS "Users can update shift templates for their business" ON public.shift_templates;

CREATE POLICY "Users can view shift templates for their business"
ON public.shift_templates
FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
);

CREATE POLICY "Users can update shift templates for their business"
ON public.shift_templates
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
);

-- RLS לטבלאת shift_template_branches
ALTER TABLE public.shift_template_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access shift_template_branches for their business"
ON public.shift_template_branches
FOR ALL
USING (
  shift_template_id IN (
    SELECT id FROM public.shift_templates
    WHERE business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- RLS וטבלת shift_roles
ALTER TABLE public.shift_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access and modify their business roles"
ON public.shift_roles
FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM public.profiles WHERE id = auth.uid()
  )
);

