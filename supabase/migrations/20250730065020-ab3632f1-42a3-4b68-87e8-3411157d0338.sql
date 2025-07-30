-- בדיקה ותיקון של הטבלה scheduled_shifts
-- הוספת העמודה shift_type במידה והיא לא קיימת

ALTER TABLE public.scheduled_shifts 
ADD COLUMN IF NOT EXISTS shift_type TEXT DEFAULT 'regular';

-- עדכון הערכים הקיימים
UPDATE public.scheduled_shifts 
SET shift_type = 'regular' 
WHERE shift_type IS NULL;