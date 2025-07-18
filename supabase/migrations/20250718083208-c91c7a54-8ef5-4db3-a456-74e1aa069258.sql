-- Create the missing available_shift for 16:00-23:30 at Big Krayot branch
INSERT INTO available_shifts (
  business_id,
  branch_id,
  shift_name,
  shift_type,
  start_time,
  end_time,
  day_of_week,
  week_start_date,
  week_end_date,
  required_employees,
  current_assignments,
  is_open_for_unassigned
) VALUES (
  'ceaee44e-663e-4c31-b873-a3a745921d12',  -- business_id
  '2ea25a1c-498d-40f6-904b-4d85c555077f',  -- Big Krayot branch_id
  'משמרת אחה"צ-ערב',
  'evening',
  '16:00:00',
  '23:30:00',
  1,  -- Monday (assuming, you can adjust)
  '2025-07-20',
  '2025-07-26',
  1,
  0,
  true
);