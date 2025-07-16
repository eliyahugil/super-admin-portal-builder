-- הוספת שדה required_employees לטבלת scheduled_shifts
ALTER TABLE public.scheduled_shifts 
ADD COLUMN IF NOT EXISTS required_employees integer DEFAULT 1;

-- הוספת אינדקס לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_required_employees 
ON public.scheduled_shifts (required_employees);

-- עדכון משמרות קיימות עם ערך ברירת מחדל
UPDATE public.scheduled_shifts 
SET required_employees = 1 
WHERE required_employees IS NULL;