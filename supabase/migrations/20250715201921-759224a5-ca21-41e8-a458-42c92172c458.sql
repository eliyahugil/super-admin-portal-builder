-- Clean up all duplicate employees by keeping only the oldest one for each name+business combination
-- This will delete all duplicates and keep only the original employee

WITH ranked_employees AS (
  SELECT 
    id,
    first_name,
    last_name,
    business_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY business_id, first_name, last_name 
      ORDER BY created_at ASC
    ) as rn
  FROM employees 
  WHERE is_active = true
),
duplicates_to_delete AS (
  SELECT id 
  FROM ranked_employees 
  WHERE rn > 1
)
DELETE FROM employees 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Verify the cleanup by showing remaining duplicates (should be 0)
SELECT 
  business_id,
  first_name, 
  last_name, 
  COUNT(*) as count
FROM employees 
WHERE is_active = true
GROUP BY business_id, first_name, last_name
HAVING COUNT(*) > 1;