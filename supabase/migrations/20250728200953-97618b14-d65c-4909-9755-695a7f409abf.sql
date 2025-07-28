-- תיקון פוליסות RLS עבור טוקני רישום עובדים 

-- הוספת פוליסה ציבורית לקריאת פונקציות RPC ציבוריות
CREATE POLICY "Public can read token info via RPC"
ON public.employee_registration_tokens
FOR SELECT
TO public
USING (true);

-- הוספת פוליסה מחודשת לקבלת מידע על הטוקן
DROP POLICY IF EXISTS "Public can view token info for valid tokens" ON public.employee_registration_tokens;

CREATE POLICY "Public can view token info for valid tokens"
ON public.employee_registration_tokens
FOR SELECT
TO public
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_registrations IS NULL OR current_registrations < max_registrations)
);

-- תיקון הפוליסה הקיימת עבור בקשות רישום
DROP POLICY IF EXISTS "Public can submit registration with valid token" ON public.employee_registration_requests;

CREATE POLICY "Public can submit registration with valid token"
ON public.employee_registration_requests
FOR INSERT
TO public
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

-- הוספת פוליסה לקריאת סניפים באמצעות טוקן תקף
CREATE POLICY "Public can view branches via valid token"
ON public.branches
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.employee_registration_tokens ert
    WHERE ert.business_id = branches.business_id
      AND ert.is_active = true
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
  )
);