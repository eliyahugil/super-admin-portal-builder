
-- תיקון מדיניות RLS לטבלת הודעות צ'אט עובדים

-- מחיקת המדיניות הקיימות
DROP POLICY IF EXISTS "Users can view messages with employees from their business" ON public.employee_chat_messages;
DROP POLICY IF EXISTS "Users can send messages to employees from their business" ON public.employee_chat_messages;
DROP POLICY IF EXISTS "Users can update messages they are part of" ON public.employee_chat_messages;

-- מדיניות חדשה לצפייה בהודעות
CREATE POLICY "Enable read access for business users and super admins" 
  ON public.employee_chat_messages 
  FOR SELECT 
  USING (
    -- סופר אדמין יכול לראות הכל
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR
    -- משתמשי עסק יכולים לראות הודעות עם עובדים מהעסק שלהם
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.profiles p ON p.business_id = e.business_id
      WHERE e.id = employee_chat_messages.employee_id 
        AND p.id = auth.uid()
        AND p.business_id IS NOT NULL
    )
  );

-- מדיניות הוספת הודעות
CREATE POLICY "Enable insert for business users and super admins" 
  ON public.employee_chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    (
      -- סופר אדמין יכול לשלוח הודעות לכל עובד
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
      OR
      -- משתמשי עסק יכולים לשלוח הודעות לעובדים מהעסק שלהם
      EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.profiles p ON p.business_id = e.business_id
        WHERE e.id = employee_chat_messages.employee_id 
          AND p.id = auth.uid()
          AND p.business_id IS NOT NULL
      )
    )
  );

-- מדיניות עדכון הודעות (לסימון כנקרא)
CREATE POLICY "Enable update for business users and super admins" 
  ON public.employee_chat_messages 
  FOR UPDATE 
  USING (
    -- סופר אדמין יכול לעדכן הודעות
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR
    -- משתמשי עסק יכולים לעדכן הודעות עם עובדים מהעסק שלהם
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.profiles p ON p.business_id = e.business_id
      WHERE e.id = employee_chat_messages.employee_id 
        AND p.id = auth.uid()
        AND p.business_id IS NOT NULL
    )
  );

-- הוספת כמה הודעות דמו לבדיקה
DO $$
DECLARE
    demo_business_id UUID;
    demo_employee_id UUID;
    demo_sender_id UUID;
BEGIN
    -- קבלת מזהה העסק דמו
    SELECT id INTO demo_business_id FROM public.businesses WHERE name = 'חברת הדמו טק בעמ' LIMIT 1;
    
    -- קבלת מזהה עובד לדוגמה
    SELECT id INTO demo_employee_id FROM public.employees WHERE business_id = demo_business_id LIMIT 1;
    
    -- קבלת מזהה המשתמש הנוכחי (סופר אדמין)
    SELECT id INTO demo_sender_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    
    -- הוספת הודעות דמו אם יש נתונים
    IF demo_business_id IS NOT NULL AND demo_employee_id IS NOT NULL AND demo_sender_id IS NOT NULL THEN
        INSERT INTO public.employee_chat_messages (employee_id, sender_id, message_content, is_read) VALUES
        (demo_employee_id, demo_sender_id, 'שלום! זה מבחן להודעה ראשונה במערכת הצ''אט החדשה.', false),
        (demo_employee_id, demo_sender_id, 'איך המשמרת היום? יש לך שאלות?', false),
        (demo_employee_id, demo_sender_id, 'זכור להגיע מוקדם מחר לפגישת הצוות.', false);
    END IF;
END $$;
