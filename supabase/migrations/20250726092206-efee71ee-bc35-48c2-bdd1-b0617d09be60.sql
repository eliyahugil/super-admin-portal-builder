-- החזרת כל העובדים לסטטוס פעיל כמו שהיה לפני המיגרציה הקודמת
UPDATE employees 
SET 
  is_active = true,
  is_archived = false, 
  updated_at = now()
WHERE business_id = '39fbddfb-93e6-4302-abb3-d3ac60d8c370';

-- הסרת ה-constraint שנוסף במיגרציה הקודמת כדי לאפשר גמישות
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS check_archived_not_active;