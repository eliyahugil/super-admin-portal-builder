-- יצירת העובד אליהו גיל מתוך הבקשה המאושרת
INSERT INTO employees (
  business_id,
  first_name,
  last_name,
  id_number,
  email,
  phone,
  birth_date,
  address,
  is_active,
  employee_type,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'ceaee44e-663e-4c31-b873-a3a745921d12',
  'אליהו',
  'גיל',
  '209145861',
  'eligil1308@gmail.com',
  '0533356145',
  '1998-08-13',
  'פטל',
  true,
  'permanent',
  current_date,
  now(),
  now()
);

-- יצירת התראה במערכת על רישום העובד
INSERT INTO activity_logs (
  user_id,
  action,
  target_type,
  target_id,
  details
) 
SELECT 
  b.owner_id,
  'employee_registration_approved',
  'employee_registration_request',
  '709ba71d-003d-4785-bed5-f27795a5a23d',
  jsonb_build_object(
    'employee_name', 'אליהו גיל',
    'employee_created', true,
    'business_name', b.name,
    'message', 'עובד חדש אליהו גיל אושר ונוסף למערכת',
    'registration_date', now(),
    'employee_id_number', '209145861'
  )
FROM businesses b 
WHERE b.id = 'ceaee44e-663e-4c31-b873-a3a745921d12';