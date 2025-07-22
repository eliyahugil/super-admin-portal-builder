-- תיקון בעיות אבטחה במדיניות RLS והוספת סכמות נתונים מלאות

-- תיקון בעיות search_path בפונקציות
DROP FUNCTION IF EXISTS public.update_registration_count();
DROP FUNCTION IF EXISTS public.create_registration_notification();

-- יצירת פונקציות מאובטחות
CREATE OR REPLACE FUNCTION public.update_registration_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.employee_registration_tokens 
    SET current_registrations = current_registrations + 1
    WHERE id = NEW.token_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.employee_registration_tokens 
    SET current_registrations = current_registrations - 1
    WHERE id = OLD.token_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_registration_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  manager_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- יצירת כותרת והודעה בהתאם לסטטוס
  CASE NEW.status
    WHEN 'pending' THEN
      notification_title := 'בקשת הוספת עובד חדש';
      notification_message := 'התקבלה בקשה להוספת עובד חדש: ' || NEW.first_name || ' ' || NEW.last_name;
    WHEN 'approved' THEN
      notification_title := 'עובד חדש אושר';
      notification_message := 'העובד ' || NEW.first_name || ' ' || NEW.last_name || ' אושר בהצלחה';
    WHEN 'rejected' THEN
      notification_title := 'בקשת עובד נדחתה';
      notification_message := 'הבקשה של ' || NEW.first_name || ' ' || NEW.last_name || ' נדחתה';
    ELSE
      RETURN NEW;
  END CASE;

  -- הוספת התראות לכל מנהלי העסק
  FOR manager_record IN 
    SELECT DISTINCT p.id as manager_id
    FROM profiles p
    JOIN businesses b ON b.owner_id = p.id OR p.business_id = b.id
    WHERE b.id = NEW.business_id
      AND p.role IN ('business_admin', 'super_admin')
  LOOP
    INSERT INTO public.employee_registration_notifications (
      registration_request_id,
      business_id,
      user_id,
      notification_type,
      title,
      message
    ) VALUES (
      NEW.id,
      NEW.business_id,
      manager_record.manager_id,
      NEW.status,
      notification_title,
      notification_message
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- יצירת פונקציות עזר מאובטחות להחזרת מידע על טוקנים
CREATE OR REPLACE FUNCTION public.get_registration_token_info(token_value TEXT)
RETURNS TABLE(
  id UUID,
  business_id UUID,
  title TEXT,
  description TEXT,
  is_active BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_registrations INTEGER,
  current_registrations INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    ert.id,
    ert.business_id,
    ert.title,
    ert.description,
    ert.is_active,
    ert.expires_at,
    ert.max_registrations,
    ert.current_registrations
  FROM public.employee_registration_tokens ert
  WHERE ert.token = token_value
    AND ert.is_active = true
    AND (ert.expires_at IS NULL OR ert.expires_at > now())
    AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  LIMIT 1;
$$;

-- יצירת פונקציה להחזרת סניפים לטוקן ספציפי
CREATE OR REPLACE FUNCTION public.get_business_branches_for_token(token_value TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    b.id,
    b.name,
    b.address,
    b.latitude,
    b.longitude
  FROM public.branches b
  JOIN public.employee_registration_tokens ert ON ert.business_id = b.business_id
  WHERE ert.token = token_value
    AND ert.is_active = true
    AND b.is_active = true
    AND (ert.expires_at IS NULL OR ert.expires_at > now())
  ORDER BY b.name;
$$;

-- עדכון מדיניות RLS לגישה ציבורית מאובטחת יותר
DROP POLICY IF EXISTS "Public can submit registration with valid token" ON public.employee_registration_requests;

CREATE POLICY "Public can submit registration with valid token"
ON public.employee_registration_requests
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.get_registration_token_info(
      (SELECT ert.token 
       FROM public.employee_registration_tokens ert 
       WHERE ert.id = employee_registration_requests.token_id)
    ) AS token_info
  )
);

-- הוספת מדיניות לגישה ציבורית לקריאת מידע על טוקנים
CREATE POLICY "Public can view token info for valid tokens"
ON public.employee_registration_tokens
FOR SELECT
TO public
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_registrations IS NULL OR current_registrations < max_registrations)
);

-- הוספת מדיניות לגישה ציבורית לקריאת סניפים עם טוקן תקין
CREATE POLICY "Public can view branches with valid registration token"
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
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);

-- יצירת פונקציה ליצירת עובד מבקשת רישום
CREATE OR REPLACE FUNCTION public.create_employee_from_registration(registration_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registration_record RECORD;
  new_employee_id UUID;
BEGIN
  -- קבלת פרטי הבקשה
  SELECT * INTO registration_record
  FROM public.employee_registration_requests
  WHERE id = registration_id
    AND status = 'approved';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found or not approved';
  END IF;
  
  -- יצירת העובד החדש
  INSERT INTO public.employees (
    business_id,
    first_name,
    last_name,
    id_number,
    email,
    phone,
    birth_date,
    address,
    employee_type,
    hire_date,
    is_active
  ) VALUES (
    registration_record.business_id,
    registration_record.first_name,
    registration_record.last_name,
    registration_record.id_number,
    registration_record.email,
    registration_record.phone,
    registration_record.birth_date,
    registration_record.address,
    'permanent',
    CURRENT_DATE,
    false  -- יהיה לא פעיל עד אישור סופי של המנהל
  ) RETURNING id INTO new_employee_id;
  
  -- העתקת העדפות סניפים אם קיימות
  IF registration_record.preferred_branches IS NOT NULL AND jsonb_array_length(registration_record.preferred_branches) > 0 THEN
    INSERT INTO public.employee_default_preferences (
      employee_id,
      business_id,
      available_days,
      shift_types,
      max_weekly_hours
    ) VALUES (
      new_employee_id,
      registration_record.business_id,
      ARRAY[0,1,2,3,4,5,6], -- ימים זמינים ברירת מחדל
      CASE 
        WHEN (registration_record.shift_preferences->>'morning')::boolean 
             AND (registration_record.shift_preferences->>'evening')::boolean THEN ARRAY['morning', 'evening']
        WHEN (registration_record.shift_preferences->>'morning')::boolean THEN ARRAY['morning']
        WHEN (registration_record.shift_preferences->>'evening')::boolean THEN ARRAY['evening']
        ELSE ARRAY['morning', 'evening']
      END,
      40 -- שעות שבועיות ברירת מחדל
    );
  END IF;
  
  -- העתקת מסמכים אם קיימים
  IF registration_record.id_document_url IS NOT NULL THEN
    INSERT INTO public.employee_documents (
      employee_id,
      document_name,
      document_type,
      file_url,
      uploaded_by,
      status,
      is_template
    ) VALUES (
      new_employee_id,
      'תעודת זהות - ' || registration_record.first_name || ' ' || registration_record.last_name,
      'id',
      registration_record.id_document_url,
      (SELECT approved_by FROM public.employee_registration_requests WHERE id = registration_id),
      'signed',
      false
    );
  END IF;
  
  RETURN new_employee_id;
END;
$$;