
-- הוספת עמודת branch_id למשמרות מתוזמנות
ALTER TABLE public.scheduled_shifts
ADD COLUMN branch_id uuid NULL;

-- הוספת אינדקס לשיפור ביצועים בסינון לפי סניף ותאריך
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_branch_date 
ON public.scheduled_shifts (branch_id, shift_date);

-- הגדרת קישור ל-branches
ALTER TABLE public.scheduled_shifts
ADD CONSTRAINT scheduled_shifts_branch_fk FOREIGN KEY (branch_id) 
REFERENCES public.branches (id) ON DELETE SET NULL;

