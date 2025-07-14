-- מחיקת כל הטוקנים הכפולים לשבוע 2025-07-20 עד 2025-07-26
DELETE FROM employee_weekly_tokens 
WHERE week_start_date = '2025-07-20' AND week_end_date = '2025-07-26';

-- יצירת טוקן אחד לכל עובד לשבוע זה (רק אם אין כבר)
INSERT INTO employee_weekly_tokens (employee_id, token, week_start_date, week_end_date, expires_at, is_active)
SELECT DISTINCT 
  e.id as employee_id,
  gen_random_uuid()::text as token,
  '2025-07-20'::date as week_start_date,
  '2025-07-26'::date as week_end_date,
  '2025-08-02 00:00:00+00'::timestamp with time zone as expires_at,
  true as is_active
FROM employees e
WHERE e.business_id = 'ceaee44e-663e-4c31-b873-a3a745921d12'
  AND e.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM employee_weekly_tokens ewt 
    WHERE ewt.employee_id = e.id 
    AND ewt.week_start_date = '2025-07-20' 
    AND ewt.week_end_date = '2025-07-26'
  );