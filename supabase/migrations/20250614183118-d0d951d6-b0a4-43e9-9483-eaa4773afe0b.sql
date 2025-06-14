
-- עדכון טבלת employee_documents: הפיכת employee_id ל NULLABLE
ALTER TABLE public.employee_documents 
ALTER COLUMN employee_id DROP NOT NULL;
