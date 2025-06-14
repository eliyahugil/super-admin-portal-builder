
-- שלב 1: הוספת שדה assignee_id (מקבל החתימה) למסמכי עובדים
ALTER TABLE public.employee_documents
ADD COLUMN assignee_id uuid NULL REFERENCES employees(id);

-- שלב 2: עדכון ברירת מחדל של סטטוס (אם תרצה להבדיל בין מסמך רגיל למסמך דיגיטלי)
ALTER TABLE public.employee_documents
ALTER COLUMN status SET DEFAULT 'pending';

-- שלב 3: לאפשר עדכון ושאילת מסמכי עובדים לכל בעלי הגישה, לא נדרש שינוי מדיניות RLS כאן.
