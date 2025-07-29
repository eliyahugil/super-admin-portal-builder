-- יצירת העובד אליהו גיל עם ה-business_id הנכון
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
  'ceaee44e-663e-4c31-b873-a3a745921d12',  -- בורקס הבולגרי
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