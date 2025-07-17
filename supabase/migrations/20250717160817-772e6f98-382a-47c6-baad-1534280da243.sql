-- יצירת טבלת הגדרות משמרות
CREATE TABLE IF NOT EXISTS public.shift_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'evening', 'night')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT NOT NULL DEFAULT '#E5E7EB',
  min_submission_hours INTEGER NOT NULL DEFAULT 48,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלת חוקי הגשה
CREATE TABLE IF NOT EXISTS public.submission_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('minimum_shifts', 'maximum_shifts', 'deadline_hours', 'custom')),
  value_numeric INTEGER,
  value_text TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלת הודעות מערכת
CREATE TABLE IF NOT EXISTS public.system_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  message_key TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('token_header', 'token_footer', 'submission_success', 'submission_error', 'reminder', 'notification')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, message_key)
);

-- יצירת טבלת הגדרות כלליות
CREATE TABLE IF NOT EXISTS public.business_general_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, setting_key)
);

-- הפעלת RLS
ALTER TABLE public.shift_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_general_settings ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות RLS
CREATE POLICY "Users can manage shift definitions for their businesses"
ON public.shift_definitions
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can manage submission rules for their businesses"
ON public.submission_rules
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can manage system messages for their businesses"
ON public.system_messages
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can manage general settings for their businesses"
ON public.business_general_settings
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- הוספת טריגרים לעדכון updated_at
CREATE TRIGGER update_shift_definitions_updated_at
BEFORE UPDATE ON public.shift_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submission_rules_updated_at
BEFORE UPDATE ON public.submission_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_messages_updated_at
BEFORE UPDATE ON public.system_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_general_settings_updated_at
BEFORE UPDATE ON public.business_general_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- הוספת אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_shift_definitions_business_id ON public.shift_definitions(business_id);
CREATE INDEX IF NOT EXISTS idx_submission_rules_business_id ON public.submission_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_system_messages_business_id ON public.system_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_business_general_settings_business_id ON public.business_general_settings(business_id);

-- הכנסת נתוני ברירת מחדל עבור הודעות מערכת
INSERT INTO public.system_messages (business_id, message_key, title, content, message_type)
SELECT 
  b.id,
  'token_header',
  'ברוכים הבאים להגשת משמרות',
  'ברוכים הבאים להגשת משמרות שבועית!' || E'\n' || 'אנא בחרו את המשמרות המועדפות עליכם לשבוע הקרוב.',
  'token_header'
FROM public.businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_messages sm 
  WHERE sm.business_id = b.id AND sm.message_key = 'token_header'
);

INSERT INTO public.system_messages (business_id, message_key, title, content, message_type)
SELECT 
  b.id,
  'token_footer',
  'תודה על ההגשה',
  'תודה על הגשתכם!' || E'\n' || 'נחזור אליכם בהקדם עם לוח המשמרות הסופי.',
  'token_footer'
FROM public.businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_messages sm 
  WHERE sm.business_id = b.id AND sm.message_key = 'token_footer'
);

INSERT INTO public.system_messages (business_id, message_key, title, content, message_type)
SELECT 
  b.id,
  'submission_success',
  'הגשה בוצעה בהצלחה',
  'ההגשה שלכם נקלטה בהצלחה במערכת!' || E'\n' || 'תקבלו עדכון לגבי לוח המשמרות הסופי בקרוב.',
  'submission_success'
FROM public.businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_messages sm 
  WHERE sm.business_id = b.id AND sm.message_key = 'submission_success'
);