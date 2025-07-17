-- תיקון מדיניות RLS עבור shift_roles כדי לתמוך גם ב-super admin
DROP POLICY IF EXISTS "Users can access and modify their business roles" ON public.shift_roles;

CREATE POLICY "Users can access and modify their business roles"
ON public.shift_roles
FOR ALL
USING (
  business_id = ANY(public.get_user_business_ids())
)
WITH CHECK (
  business_id = ANY(public.get_user_business_ids())
);