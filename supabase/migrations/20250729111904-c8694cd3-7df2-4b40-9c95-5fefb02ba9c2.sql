-- תיקון נוסף ל-RLS policies של employee_registration_tokens
-- נוסיף policy מפורש שמאפשר גישה לטוקנים בזמן בדיקת הרשאות

-- מחיקת ה-policy הישן והוספת אחד חדש
DROP POLICY IF EXISTS "Public can read token info via RPC" ON public.employee_registration_tokens;

-- יצירת policy חדש שמאפשר קריאה לטוקנים תקפים למטרת אימות
CREATE POLICY "Allow token validation access" 
ON public.employee_registration_tokens 
FOR SELECT 
TO anon, authenticated, service_role
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_registrations IS NULL OR current_registrations < max_registrations)
);