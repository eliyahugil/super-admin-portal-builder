
-- יצירת טבלה להודעות צ'אט אישיות
CREATE TABLE public.employee_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- הפעלת Row Level Security
ALTER TABLE public.employee_chat_messages ENABLE ROW LEVEL SECURITY;

-- מדיניות גישה - משתמשים יכולים לראות הודעות רק עם עובדים מהעסק שלהם
CREATE POLICY "Users can view messages with employees from their business" 
  ON public.employee_chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.profiles p ON p.business_id = e.business_id
      WHERE e.id = employee_chat_messages.employee_id 
        AND p.id = auth.uid()
        AND p.business_id IS NOT NULL
    )
    OR 
    -- סופר אדמין יכול לראות הכל
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- מדיניות הוספת הודעות
CREATE POLICY "Users can send messages to employees from their business" 
  ON public.employee_chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    (
      EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.profiles p ON p.business_id = e.business_id
        WHERE e.id = employee_chat_messages.employee_id 
          AND p.id = auth.uid()
          AND p.business_id IS NOT NULL
      )
      OR 
      -- סופר אדמין יכול לשלוח הודעות לכל עובד
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
    )
  );

-- מדיניות עדכון הודעות (לסימון כנקרא)
CREATE POLICY "Users can update messages they are part of" 
  ON public.employee_chat_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.profiles p ON p.business_id = e.business_id
      WHERE e.id = employee_chat_messages.employee_id 
        AND p.id = auth.uid()
        AND p.business_id IS NOT NULL
    )
    OR 
    -- סופר אדמין יכול לעדכן הודעות
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- אינדקס לביצועים טובים יותר
CREATE INDEX idx_employee_chat_messages_employee_id ON public.employee_chat_messages(employee_id);
CREATE INDEX idx_employee_chat_messages_created_at ON public.employee_chat_messages(created_at);
CREATE INDEX idx_employee_chat_messages_sender_id ON public.employee_chat_messages(sender_id);
