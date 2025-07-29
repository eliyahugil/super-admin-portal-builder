-- יצירת בקשת רישום חדשה לעובד "בדיקה בדיקה" בסטטוס pending
INSERT INTO employee_registration_requests (
  business_id,
  token_id,
  first_name,
  last_name,
  id_number,
  email,
  phone,
  birth_date,
  address,
  preferred_branch_id,
  available_days,
  shift_types_preference,
  max_weekly_hours,
  status
) VALUES (
  (SELECT business_id FROM employee_registration_tokens WHERE is_active = true LIMIT 1),
  (SELECT id FROM employee_registration_tokens WHERE is_active = true LIMIT 1),
  'בדיקה',
  'בדיקה',
  '123456789',
  'test@example.com',
  '050-1234567',
  '1990-01-01',
  'כתובת לדוגמה',
  (SELECT id FROM branches WHERE is_active = true LIMIT 1),
  ARRAY[0,1,2,3,4,5,6],
  ARRAY['morning', 'evening'],
  40,
  'pending'
);