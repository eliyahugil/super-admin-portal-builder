-- יצירת התראה במערכת על רישום העובד עם user_id נכון
INSERT INTO activity_logs (
  user_id,
  action,
  target_type,
  target_id,
  details
) VALUES (
  (SELECT COALESCE(owner_id, (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1)) 
   FROM businesses WHERE id = 'ceaee44e-663e-4c31-b873-a3a745921d12'),
  'employee_registration_approved',
  'employee_registration_request',
  '709ba71d-003d-4785-bed5-f27795a5a23d',
  jsonb_build_object(
    'employee_name', 'אליהו גיל',
    'employee_created', true,
    'business_name', (SELECT name FROM businesses WHERE id = 'ceaee44e-663e-4c31-b873-a3a745921d12'),
    'message', 'עובד חדש אליהו גיל אושר ונוסף למערכת',
    'registration_date', now(),
    'employee_id_number', '209145861'
  )
);