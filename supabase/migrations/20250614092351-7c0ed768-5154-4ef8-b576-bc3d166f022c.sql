
-- הוספת עמודה לזיהוי העסק
ALTER TABLE public.scheduled_shifts
ADD COLUMN IF NOT EXISTS business_id uuid;

-- עדכון ערכי business_id למשמרות קיימות (אם זה רלוונטי, למשל לפי branch_id)
-- אם branch_id קיים ונכון, נעדכן:
UPDATE public.scheduled_shifts s
SET business_id = b.business_id
FROM public.branches b
WHERE s.branch_id = b.id AND s.business_id IS NULL;

-- הפעלת RLS (אם עוד לא קיים)
ALTER TABLE public.scheduled_shifts ENABLE ROW LEVEL SECURITY;

-- הסרת מדיניות קיימת (אם היא משתמשת ב-business_id ומייצרת בעיה)
DROP POLICY IF EXISTS "Users can manage scheduled shifts for their businesses" ON public.scheduled_shifts;

-- יצירת RLS מאובטחת לפי business_id:
CREATE POLICY "Users can manage scheduled shifts for their businesses" ON public.scheduled_shifts
FOR ALL
USING (
  business_id = ANY(public.get_user_business_ids())
) WITH CHECK (
  business_id = ANY(public.get_user_business_ids())
);

-- הוספת אינדקס לשדה
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_business_id
ON public.scheduled_shifts (business_id);

