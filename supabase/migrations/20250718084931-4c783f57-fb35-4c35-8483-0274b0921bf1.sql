-- First get the correct business_id and branch_id from existing shift
WITH existing_shift AS (
  SELECT business_id, branch_id 
  FROM public.available_shifts 
  WHERE shift_name = 'בורקס הבולגרי ביג קריות' 
  LIMIT 1
)
-- Insert the missing shifts for all days (Sunday through Thursday)
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
SELECT 
  es.business_id,
  '2025-01-12'::date,
  '2025-01-18'::date,
  day_num,
  '16:00:00'::time,
  '23:30:00'::time,
  'evening',
  'בורקס הבולגרי ביג קריות',
  1,
  0,
  true,
  es.branch_id
FROM existing_shift es
CROSS JOIN (VALUES (0), (2), (3), (4)) AS days(day_num);