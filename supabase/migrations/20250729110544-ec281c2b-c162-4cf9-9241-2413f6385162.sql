-- בדיקה של מדיניות RLS עבור employee_registration_requests
-- הבעיה כנראה במדיניות INSERT שדורשת שטוקן יהיה תקף

-- בואו נראה את המדיניות הנוכחית ונתקן אותה אם נדרש
-- המדיניות הנוכחית בודקת:
-- 1. הטוקן קיים וממוקם בנכון
-- 2. הטוקן פעיל 
-- 3. הטוקן לא פג תוקף
-- 4. הטוקן לא הגיע למגבלת רישומים

-- אולי הבעיה היא שהטוקן לא נמצא או שהתנאים לא מתקיימים
-- בואו נוודא שמדיניות ה-RLS מתירה רישום אנונימי עם טוקן תקף

-- ראשית, בואו נוודא שמדיניות ה-RLS קיימת ומתעדכנת
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

-- בואו גם נוודא שמדיניות הקריאה מתירה לעסקים לראות את הבקשות שלהם
CREATE POLICY IF NOT EXISTS "Business users can view registration requests for their business" 
ON public.employee_registration_requests 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

-- ומדיניות עדכון לעסקים
CREATE POLICY IF NOT EXISTS "Business users can update registration requests for their business" 
ON public.employee_registration_requests 
FOR UPDATE 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));