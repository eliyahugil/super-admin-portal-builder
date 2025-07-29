-- תיקון RLS policy לטבלת employee_registration_requests
-- הבעיה: ה-policy לא מאפשר INSERT למשתמשים אנונימיים

-- קודם נמחק את ה-policy הקיים
DROP POLICY IF EXISTS "Allow anonymous registration with valid token" ON public.employee_registration_requests;

-- ניצור policy חדש שמאפשר INSERT בלי בדיקת authentication
CREATE POLICY "Allow anonymous registration with valid token" 
ON public.employee_registration_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.employee_registration_tokens ert
    WHERE ert.id = employee_registration_requests.token_id 
      AND ert.business_id = employee_registration_requests.business_id
      AND ert.is_active = true 
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);