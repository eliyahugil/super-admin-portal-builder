-- מחיקת ההתראה הקיימת על האישור
DELETE FROM activity_logs WHERE target_id = '709ba71d-003d-4785-bed5-f27795a5a23d';

-- יצירת התראה חדשה על ההגשה הראשונית
INSERT INTO activity_logs (
  user_id,
  action,
  target_type,
  target_id,
  details,
  created_at
) VALUES (
  (SELECT COALESCE(owner_id, (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1)) 
   FROM businesses WHERE id = 'ceaee44e-663e-4c31-b873-a3a745921d12'),
  'employee_registration_submitted',
  'employee_registration_request',
  '709ba71d-003d-4785-bed5-f27795a5a23d',
  jsonb_build_object(
    'employee_name', 'אליהו גיל',
    'business_name', (SELECT name FROM businesses WHERE id = 'ceaee44e-663e-4c31-b873-a3a745921d12'),
    'message', 'העובד אליהו גיל הגיש בקשת רישום חדשה למערכת',
    'submission_date', '2025-07-29 11:34:35.26+00'::timestamp,
    'employee_id_number', '209145861',
    'status', 'pending'
  ),
  '2025-07-29 11:34:35.26+00'::timestamp
);