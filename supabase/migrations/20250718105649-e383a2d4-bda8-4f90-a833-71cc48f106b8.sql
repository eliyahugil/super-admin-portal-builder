-- Create a new submission token for the employee who already submitted
INSERT INTO public.shift_submission_tokens (
  business_id,
  employee_id,
  token,
  expires_at,
  week_start_date,
  week_end_date,
  max_submissions,
  current_submissions,
  is_active
) VALUES (
  'ceaee44e-663e-4c31-b873-a3a745921d12',
  'e6d07b05-0c10-4316-b055-ae7b564cd32e',
  'new-token-' || gen_random_uuid(),
  NOW() + INTERVAL '7 days',
  '2025-07-20',
  '2025-07-26',
  5,
  0,
  true
);