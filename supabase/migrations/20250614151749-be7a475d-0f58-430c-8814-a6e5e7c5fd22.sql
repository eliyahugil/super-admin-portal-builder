
-- הוספת עמודות לטבלת עובדים עבור משתמש מערכת
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_system_user BOOLEAN NOT NULL DEFAULT false;

-- אינדקס מהיר על username
CREATE INDEX IF NOT EXISTS idx_employees_username ON public.employees(username);

-- ודא שתאריך סיום קיים, כבר קיים בעמודה termination_date

-- אין צורך בהוספת שדות תאריך התחלה (hire_date) – כבר קיים

