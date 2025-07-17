-- Fix employee_id in employee_weekly_tokens
UPDATE employee_weekly_tokens 
SET employee_id = (
  SELECT e.id 
  FROM employees e 
  WHERE e.first_name = (
    SELECT first_name FROM employees WHERE business_id = employee_weekly_tokens.business_id LIMIT 1
  )
  AND e.business_id = employee_weekly_tokens.business_id
  LIMIT 1
)
WHERE employee_id IS NULL;