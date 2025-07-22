-- יצירת מערכת טוקני הוספת עובדים ובקשות רישום

-- טבלת טוקני הוספת עובדים
CREATE TABLE public.employee_registration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_registrations INTEGER,
  current_registrations INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- טבלת בקשות הוספת עובדים
CREATE TABLE public.employee_registration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.employee_registration_tokens(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- פרטים אישיים
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date DATE NOT NULL,
  address TEXT,
  
  -- העדפות סניפים
  preferred_branches JSONB DEFAULT '[]'::jsonb,
  branch_assignment_notes TEXT,
  
  -- העדפות משמרות
  shift_preferences JSONB DEFAULT '{
    "morning": true,
    "evening": true,
    "fixed_availability": {},
    "unavailable_days": {},
    "notes": ""
  }'::jsonb,
  
  -- מסמכים
  id_document_url TEXT,
  additional_documents JSONB DEFAULT '[]'::jsonb,
  
  -- חתימות דיגיטליות
  digital_signatures JSONB DEFAULT '[]'::jsonb,
  agreements_signed JSONB DEFAULT '[]'::jsonb,
  
  -- סטטוס הבקשה
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'incomplete')),
  notes TEXT,
  
  -- אישור מנהל
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- זמנים
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- טבלת התראות הוספת עובדים
CREATE TABLE public.employee_registration_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_request_id UUID NOT NULL REFERENCES public.employee_registration_requests(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת אינדקסים
CREATE INDEX idx_employee_registration_tokens_business_id ON public.employee_registration_tokens(business_id);
CREATE INDEX idx_employee_registration_tokens_token ON public.employee_registration_tokens(token);
CREATE INDEX idx_employee_registration_requests_token_id ON public.employee_registration_requests(token_id);
CREATE INDEX idx_employee_registration_requests_business_id ON public.employee_registration_requests(business_id);
CREATE INDEX idx_employee_registration_requests_status ON public.employee_registration_requests(status);
CREATE INDEX idx_employee_registration_notifications_user_id ON public.employee_registration_notifications(user_id);
CREATE INDEX idx_employee_registration_notifications_business_id ON public.employee_registration_notifications(business_id);

-- הפעלת RLS
ALTER TABLE public.employee_registration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_registration_notifications ENABLE ROW LEVEL SECURITY;

-- מדיניות RLS לטוקני הוספת עובדים
CREATE POLICY "Business users can manage registration tokens"
ON public.employee_registration_tokens
FOR ALL
USING (business_id = ANY(get_user_business_ids()))
WITH CHECK (business_id = ANY(get_user_business_ids()));

-- מדיניות RLS לבקשות הוספת עובדים - גישה ציבורית לכתיבה עם טוקן תקין
CREATE POLICY "Public can submit registration with valid token"
ON public.employee_registration_requests
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.employee_registration_tokens ert
    WHERE ert.id = employee_registration_requests.token_id
      AND ert.is_active = true
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);

-- מדיניות RLS לקריאת בקשות הוספת עובדים
CREATE POLICY "Business users can view registration requests"
ON public.employee_registration_requests
FOR SELECT
USING (business_id = ANY(get_user_business_ids()));

-- מדיניות RLS לעדכון בקשות הוספת עובדים
CREATE POLICY "Business users can update registration requests"
ON public.employee_registration_requests
FOR UPDATE
USING (business_id = ANY(get_user_business_ids()))
WITH CHECK (business_id = ANY(get_user_business_ids()));

-- מדיניות RLS להתראות
CREATE POLICY "Users can view their registration notifications"
ON public.employee_registration_notifications
FOR SELECT
USING (user_id = auth.uid() OR business_id = ANY(get_user_business_ids()));

CREATE POLICY "System can insert registration notifications"
ON public.employee_registration_notifications
FOR INSERT
WITH CHECK (true);

-- טריגר לעדכון updated_at
CREATE TRIGGER update_employee_registration_tokens_updated_at
  BEFORE UPDATE ON public.employee_registration_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_registration_requests_updated_at
  BEFORE UPDATE ON public.employee_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- פונקציה לעדכון מספר הרשמות
CREATE OR REPLACE FUNCTION public.update_registration_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- טריגר לעדכון מספר הרשמות
CREATE TRIGGER update_registration_count_trigger
  AFTER INSERT OR DELETE ON public.employee_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_registration_count();

-- פונקציה ליצירת התראות אוטומטיות
CREATE OR REPLACE FUNCTION public.create_registration_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- טריגר ליצירת התראות
CREATE TRIGGER create_registration_notification_trigger
  AFTER INSERT OR UPDATE OF status ON public.employee_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_registration_notification();