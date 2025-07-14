-- מחיקת כל הטוקנים הכפולים לשבוע הנוכחי
DELETE FROM employee_weekly_tokens 
WHERE week_start_date = '2025-07-20' AND week_end_date = '2025-07-26';

-- הוספת unique constraint למניעת כפילויות בעתיד
ALTER TABLE employee_weekly_tokens 
ADD CONSTRAINT unique_employee_week 
UNIQUE (employee_id, week_start_date, week_end_date);