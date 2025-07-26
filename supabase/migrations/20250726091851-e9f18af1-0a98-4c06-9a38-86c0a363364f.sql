-- תיקון נתוני עובדים: עובדים בארכיון צריכים להיות לא פעילים
UPDATE employees 
SET is_active = false, updated_at = now()
WHERE is_archived = true AND is_active = true;

-- הוספת constraint לוודא שזה לא יקרה שוב
ALTER TABLE employees 
ADD CONSTRAINT check_archived_not_active 
CHECK (NOT (is_archived = true AND is_active = true));