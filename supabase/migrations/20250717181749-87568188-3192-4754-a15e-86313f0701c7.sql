-- Delete duplicate tokens, keep only the latest one for each employee/week combination
DELETE FROM employee_weekly_tokens 
WHERE id NOT IN (
  SELECT DISTINCT ON (employee_id, week_start_date) id
  FROM employee_weekly_tokens 
  WHERE employee_id IS NOT NULL
  ORDER BY employee_id, week_start_date, created_at DESC
);

-- Now update the remaining tokens where employee_id is null
UPDATE employee_weekly_tokens 
SET employee_id = '0113d941-6d65-41a7-a23e-b40ff142be13'
WHERE employee_id IS NULL 
AND NOT EXISTS (
  SELECT 1 FROM employee_weekly_tokens ewt2 
  WHERE ewt2.employee_id = '0113d941-6d65-41a7-a23e-b40ff142be13' 
  AND ewt2.week_start_date = employee_weekly_tokens.week_start_date
  AND ewt2.id != employee_weekly_tokens.id
);