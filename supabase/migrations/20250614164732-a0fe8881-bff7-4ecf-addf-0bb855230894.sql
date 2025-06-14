
-- הוספת שדות ל-business_settings עבור הרשאות כלליות של עובדים

ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS allow_employee_reporting_web boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_employee_gps boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_employee_image boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_shift_editing boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_past_shift_editing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_shift_submission_without_token boolean NOT NULL DEFAULT false;

-- ניתן להוסיף כאן עוד עמודות של הרשאות לפי הדרישה שלך.
