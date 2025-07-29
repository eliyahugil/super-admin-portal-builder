-- תיקון RLS policies להתראות כדי שסופר אדמין יוכל לראות התראות של כל העסקים

-- עדכון policy עבור employee_registration_notifications
DROP POLICY IF EXISTS "Users can view their registration notifications" ON employee_registration_notifications;

CREATE POLICY "Users can view their registration notifications"
ON employee_registration_notifications
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
  OR
  business_id = ANY (get_user_business_ids())
);

-- עדכון policy עבור advanced_notifications
DROP POLICY IF EXISTS "Business users can view their business notifications" ON advanced_notifications;

CREATE POLICY "Business users can view their business notifications"
ON advanced_notifications
FOR SELECT
USING (
  business_id = ANY (get_user_business_ids())
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);