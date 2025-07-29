-- ניקוי כל ה-policies הישנים ויצירת policy חדש ופשוט
-- מחיקת כל policies קיימים עבור employee_registration_requests
DROP POLICY IF EXISTS "Allow anonymous registration with valid token" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Allow public registration submissions" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can view registration requests" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can view registration requests for their busines" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can update registration requests" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can update registration requests for their busin" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can delete registration requests" ON public.employee_registration_requests;

-- יצירת policy אחד פשוט לכל פעולה
-- INSERT policy - מאפשר הכנסה לכולם
CREATE POLICY "public_insert_registration_requests" 
ON public.employee_registration_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- SELECT policy - מאפשר לאנשי העסק לראות 
CREATE POLICY "business_select_registration_requests" 
ON public.employee_registration_requests 
FOR SELECT 
TO authenticated
USING (business_id = ANY (get_user_business_ids()));

-- UPDATE policy - מאפשר לאנשי העסק לעדכן
CREATE POLICY "business_update_registration_requests" 
ON public.employee_registration_requests 
FOR UPDATE 
TO authenticated
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- DELETE policy - מאפשר לאנשי העסק למחוק
CREATE POLICY "business_delete_registration_requests" 
ON public.employee_registration_requests 
FOR DELETE 
TO authenticated
USING (business_id = ANY (get_user_business_ids()));

-- בדיקה שהטבלה קיימת ו-RLS מופעל
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'employee_registration_requests';