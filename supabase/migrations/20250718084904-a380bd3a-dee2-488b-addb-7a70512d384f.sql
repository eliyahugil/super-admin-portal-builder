-- Insert the missing shifts for all days (Sunday through Thursday)
-- Current shift exists only for Monday (day 1), need to add for Sunday (0), Tuesday (2), Wednesday (3), Thursday (4)

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
  ('8b41e0b8-0b72-4ba9-bbf0-3d2c1f5a8d42', '2025-01-12', '2025-01-18', 0, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '92709f21-0dc5-4c71-8b3b-4d8c1f5a8d42'),
  -- Tuesday (day 2)
  ('8b41e0b8-0b72-4ba9-bbf0-3d2c1f5a8d42', '2025-01-12', '2025-01-18', 2, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '92709f21-0dc5-4c71-8b3b-4d8c1f5a8d42'),
  -- Wednesday (day 3)
  ('8b41e0b8-0b72-4ba9-bbf0-3d2c1f5a8d42', '2025-01-12', '2025-01-18', 3, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '92709f21-0dc5-4c71-8b3b-4d8c1f5a8d42'),
  -- Thursday (day 4)
  ('8b41e0b8-0b72-4ba9-bbf0-3d2c1f5a8d42', '2025-01-12', '2025-01-18', 4, '16:00:00', '23:30:00', 'evening', 'בורקס הבולגרי ביג קריות', 1, 0, true, '92709f21-0dc5-4c71-8b3b-4d8c1f5a8d42');