-- תיקון מדיניות RLS עבור employee_registration_requests
-- המדיניות הקיימת נראית נכונה, אבל בואו נוודא שהיא עובדת כראוי

-- מחיקת המדיניות הקיימת וחידוש שלה
DROP POLICY IF EXISTS "Allow anonymous registration with valid token" ON public.employee_registration_requests;

-- יצירת מדיניות RLS מעודכנת לרישום אנונימי
CREATE POLICY "Allow anonymous registration with valid token"
ON public.employee_registration_requests
FOR INSERT
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

-- בדיקה שמדיניות הקריאה קיימת (ללא IF NOT EXISTS שגורם לשגיאה)
DROP POLICY IF EXISTS "Business users can view registration requests for their business" ON public.employee_registration_requests;
CREATE POLICY "Business users can view registration requests for their business" 
ON public.employee_registration_requests 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

-- בדיקה שמדיניות העדכון קיימת
DROP POLICY IF EXISTS "Business users can update registration requests for their business" ON public.employee_registration_requests;
CREATE POLICY "Business users can update registration requests for their business" 
ON public.employee_registration_requests 
FOR UPDATE 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));