-- תיקון מדיניות RLS לטבלה employee_registration_requests
-- מאפשר לכולם להוסיף בקשות רישום עם טוקן תקף

DROP POLICY IF EXISTS "Public can insert employee registration requests with valid tok" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Public can submit registration with valid token" ON public.employee_registration_requests;

-- מדיניות חדשה שמאפשרת לכולם להוסיף בקשות רישום עם טוקן תקף
CREATE POLICY "Allow public registration requests with valid token" 
ON public.employee_registration_requests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.employee_registration_tokens ert
    WHERE ert.id = employee_registration_requests.token_id
      AND ert.is_active = true
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);

-- מדיניות לקריאה למנהלי העסק
CREATE POLICY "Business users can view registration requests" 
ON public.employee_registration_requests 
FOR SELECT 
USING (
  business_id IN (
    SELECT DISTINCT b.id
    FROM businesses b
    JOIN profiles p ON ((p.business_id = b.id) OR (b.owner_id = p.id))
    WHERE (p.id = auth.uid() AND p.role = ANY (ARRAY['business_admin'::user_role, 'super_admin'::user_role]))
  ) OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
    )
  )
);

-- מדיניות לעדכון למנהלי העסק
CREATE POLICY "Business users can update registration requests" 
ON public.employee_registration_requests 
FOR UPDATE 
USING (
  business_id IN (
    SELECT DISTINCT b.id
    FROM businesses b
    JOIN profiles p ON ((p.business_id = b.id) OR (b.owner_id = p.id))
    WHERE (p.id = auth.uid() AND p.role = ANY (ARRAY['business_admin'::user_role, 'super_admin'::user_role]))
  ) OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
    )
  )
);