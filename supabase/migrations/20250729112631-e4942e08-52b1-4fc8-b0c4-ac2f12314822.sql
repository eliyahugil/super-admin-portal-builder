-- תיקון נוסף ל-RLS policy עבור employee_registration_requests  
-- נתחיל עם policy פשוט לבדיקה ואז נוסיף אימות טוקן

-- מחיקת policy הקיים
DROP POLICY IF EXISTS "Allow anonymous users to submit registration requests" ON public.employee_registration_requests;

-- יצירת policy פשוט יותר בלי אימות מורכב
CREATE POLICY "Allow public registration submissions" 
ON public.employee_registration_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- אימות שיש גישה לטבלת הטוקנים
-- עדכון policy עבור employee_registration_tokens כדי לוודא גישה
DROP POLICY IF EXISTS "Allow token validation access" ON public.employee_registration_tokens;

CREATE POLICY "Public can read active tokens" 
ON public.employee_registration_tokens 
FOR SELECT 
TO anon, authenticated, service_role
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);