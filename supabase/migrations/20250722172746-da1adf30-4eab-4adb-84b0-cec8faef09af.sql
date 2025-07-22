-- תיקון בעיות אבטחה בפונקציות - מחיקה נכונה של טריגרים קודם

-- מחיקת טריגרים תחילה
DROP TRIGGER IF EXISTS update_registration_count_trigger ON public.employee_registration_requests;
DROP TRIGGER IF EXISTS create_registration_notification_trigger ON public.employee_registration_requests;

-- מחיקת פונקציות
DROP FUNCTION IF EXISTS public.update_registration_count();
DROP FUNCTION IF EXISTS public.create_registration_notification();

-- יצירת פונקציות מאובטחות עם search_path מתוקן
CREATE OR REPLACE FUNCTION public.update_registration_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE employee_registration_tokens 
    SET current_registrations = current_registrations + 1
    WHERE id = NEW.token_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE employee_registration_tokens 
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
    INSERT INTO employee_registration_notifications (
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

-- יצירת טריגרים מחדש
CREATE TRIGGER update_registration_count_trigger
  AFTER INSERT OR DELETE ON public.employee_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_registration_count();

CREATE TRIGGER create_registration_notification_trigger
  AFTER INSERT OR UPDATE OF status ON public.employee_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_registration_notification();

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
  FROM employee_registration_tokens ert
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
  FROM branches b
  JOIN employee_registration_tokens ert ON ert.business_id = b.business_id
  WHERE ert.token = token_value
    AND ert.is_active = true
    AND b.is_active = true
    AND (ert.expires_at IS NULL OR ert.expires_at > now())
  ORDER BY b.name;
$$;