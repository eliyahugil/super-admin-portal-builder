
-- הוספת עמודת is_archived לטבלת המשמרות
ALTER TABLE public.scheduled_shifts
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- אינדקס לשיפור ביצועים בסינון לפי is_archived
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_is_archived
ON public.scheduled_shifts (is_archived);

-- (רשות) ניתן להוסיף RLS אם יש צורך בהגבלת הרשאות – כרגע לא מצויין אחת כזו במערכת

