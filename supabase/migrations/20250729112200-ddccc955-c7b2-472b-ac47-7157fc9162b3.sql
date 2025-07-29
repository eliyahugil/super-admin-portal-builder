-- תיקון RLS policies עבור employee_registration_requests
-- מחיקת כל policies קיימים עבור employee_registration_requests
DROP POLICY IF EXISTS "Allow public insert for employee registration" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Allow token-based insert for employee registration" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can view employee registration requests" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Allow business users to view registration requests" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Allow business users to update registration requests" ON public.employee_registration_requests;

-- הפעלת RLS על הטבלה
ALTER TABLE public.employee_registration_requests ENABLE ROW LEVEL SECURITY;

-- יצירת policy חדש שמאפשר ל-anonymous users להכניס נתונים
CREATE POLICY "Allow anonymous users to submit registration requests" 
ON public.employee_registration_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- בדיקה שהטוקן תקף
  EXISTS (
    SELECT 1 
    FROM public.employee_registration_tokens ert
    WHERE ert.id = employee_registration_requests.token_id
      AND ert.is_active = true
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);

-- policy לקריאה עבור משתמשי העסק
CREATE POLICY "Business users can view registration requests" 
ON public.employee_registration_requests 
FOR SELECT 
TO authenticated
USING (business_id = ANY (get_user_business_ids()));

-- policy לעדכון עבור משתמשי העסק  
CREATE POLICY "Business users can update registration requests" 
ON public.employee_registration_requests 
FOR UPDATE 
TO authenticated
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- policy למחיקה עבור משתמשי העסק
CREATE POLICY "Business users can delete registration requests" 
ON public.employee_registration_requests 
FOR DELETE 
TO authenticated
USING (business_id = ANY (get_user_business_ids()));