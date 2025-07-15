-- Clean up duplicate employees by keeping the oldest one for each name+business combination
-- Delete duplicate "Neral Elias" entries (keep the oldest one from each business)
DELETE FROM employees 
WHERE id IN (
  'b808d89d-b932-4743-a062-426d2ffc493d',
  '8fd13b6b-d486-47db-96a4-bdd4602a124d'
) AND first_name = 'Neral Elias';

-- Delete duplicate "אגם בוגנים" entries (keep the oldest one)
DELETE FROM employees 
WHERE id = '70a98808-9d8b-4afa-9697-480391abd439' 
AND first_name = 'אגם' 
AND last_name = 'בוגנים';

-- Add a unique constraint to prevent future duplicates based on name and business
CREATE UNIQUE INDEX idx_employees_unique_name_business 
ON employees (business_id, first_name, last_name, employee_id) 
WHERE is_active = true;