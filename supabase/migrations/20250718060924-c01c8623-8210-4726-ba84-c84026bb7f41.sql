-- מחיקת כל הטבלאות והמידע הקשור לטוקנים שבועיים והגשת משמרות
DROP TABLE IF EXISTS public.employee_weekly_tokens CASCADE;
DROP TABLE IF EXISTS public.employee_quick_add_tokens CASCADE;
DROP TABLE IF EXISTS public.shift_submissions CASCADE;
DROP TABLE IF EXISTS public.shift_token_schedules CASCADE;

-- מחיקת טבלאות קשורות נוספות אם קיימות
DROP TABLE IF EXISTS public.shift_requests CASCADE;
DROP TABLE IF EXISTS public.shift_tokens CASCADE;

-- הסרת עמודות מטבלת העובדים הקשורות לטוקנים
ALTER TABLE public.employees 
DROP COLUMN IF EXISTS shift_submission_quota CASCADE;

-- ניקוי הגדרות עסק הקשורות לטוקנים
ALTER TABLE public.business_settings 
DROP COLUMN IF EXISTS allow_shift_submission_without_token CASCADE;