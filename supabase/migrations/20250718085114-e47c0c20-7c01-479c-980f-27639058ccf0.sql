-- Add the בורקס הבולגרי ביג קריות shift for all days (Sunday through Thursday) for the current week
INSERT INTO public.available_shifts (
  business_id,
  week_start_date,
  week_end_date,
  day_of_week,
  start_time,
  end_time,
  shift_type,
  shift_name,
  required_employees,
  current_assignments,
  is_open_for_unassigned,
  branch_id
)
VALUES
  -- Sunday (day 0)
  ('ceaee44e-663e-4c31-b873-a3a745921d12', '2025-07-20', '2025-07-26', 0, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '2ea25a1c-498d-40f6-904b-4d85c555077f'),
  -- Monday (day 1)
  ('ceaee44e-663e-4c31-b873-a3a745921d12', '2025-07-20', '2025-07-26', 1, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '2ea25a1c-498d-40f6-904b-4d85c555077f'),
  -- Tuesday (day 2)
  ('ceaee44e-663e-4c31-b873-a3a745921d12', '2025-07-20', '2025-07-26', 2, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '2ea25a1c-498d-40f6-904b-4d85c555077f'),
  -- Wednesday (day 3)
  ('ceaee44e-663e-4c31-b873-a3a745921d12', '2025-07-20', '2025-07-26', 3, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '2ea25a1c-498d-40f6-904b-4d85c555077f'),
  -- Thursday (day 4)
  ('ceaee44e-663e-4c31-b873-a3a745921d12', '2025-07-20', '2025-07-26', 4, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '2ea25a1c-498d-40f6-904b-4d85c555077f');