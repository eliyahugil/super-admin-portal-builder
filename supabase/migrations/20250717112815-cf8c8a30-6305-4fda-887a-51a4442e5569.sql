-- הוספת עמודה לזמינות למשמרות בוקר אופציונליות
ALTER TABLE public.shift_submissions 
ADD COLUMN IF NOT EXISTS optional_morning_availability INTEGER[] DEFAULT NULL;

-- הוספת תיאור לעמודה החדשה
COMMENT ON COLUMN public.shift_submissions.optional_morning_availability IS 'ימים בשבוע בהם העובד זמין למשמרות בוקר אופציונליות (0=ראשון, 1=שני, וכו)';

-- יצירת אינדקס לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_shift_submissions_optional_morning 
ON public.shift_submissions USING GIN(optional_morning_availability);