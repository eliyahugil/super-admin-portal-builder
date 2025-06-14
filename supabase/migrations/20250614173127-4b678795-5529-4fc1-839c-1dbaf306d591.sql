
-- הוספת שדה status למסמכים + ברירת מחדל ממתין
ALTER TABLE public.employee_documents
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- הוספת שדה reminder_count
ALTER TABLE public.employee_documents
ADD COLUMN reminder_count integer NOT NULL DEFAULT 0;

-- הוספת שדה reminder_sent (זמן שליחת תזכורת אחרונה)
ALTER TABLE public.employee_documents
ADD COLUMN reminder_sent_at timestamp with time zone;

-- טבלת תזכורות למסמכים עובדים - לוג תזכורת לכל שליחה (מייל/וואטסאפ/מערכת)
CREATE TABLE IF NOT EXISTS public.employee_document_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.employee_documents(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  sent_by uuid REFERENCES public.profiles(id),
  reminder_type text NOT NULL, -- system/whatsapp/sms/email
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  message text
);

-- RLS: צפיה והוספת תזכורת רק ע"י מי שמורשה (המשתמש שמנהל או העובד)
ALTER TABLE public.employee_document_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow relevant users" ON public.employee_document_reminders
  FOR SELECT
  USING (
    (auth.uid() = employee_id) -- העובד עצמו
    OR
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'business_admin')))
  );

CREATE POLICY "allow insert by admins" ON public.employee_document_reminders
  FOR INSERT
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'business_admin')))
  );
