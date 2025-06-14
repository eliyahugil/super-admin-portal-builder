
-- שלב 1: הוספת עמודה is_template למסמכי עובדים
ALTER TABLE public.employee_documents
ADD COLUMN is_template boolean NOT NULL DEFAULT false;

-- שלב 2: אינדקס על is_template לשאילות מהירות
CREATE INDEX IF NOT EXISTS idx_employee_documents_is_template
  ON public.employee_documents(is_template);

-- שלב 3: עדכון תיעוד (אם יש צורך בשדה תיאור נוסף לתבנית, נא ליידע אותי)
