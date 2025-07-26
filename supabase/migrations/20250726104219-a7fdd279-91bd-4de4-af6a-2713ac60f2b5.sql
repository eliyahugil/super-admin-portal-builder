-- עדכון הגדרות סוגי משמרות בעסק להתאמה לשעות הנכונות
-- משמרות שמתחילות מ-16:00 צריכות להיחשב כ-evening ולא afternoon

-- עדכון משמרות קיימות שמתחילות מ-16:00 להיחשב כ-evening
UPDATE scheduled_shifts 
SET shift_type = 'evening'
WHERE start_time >= '16:00:00' AND start_time < '22:00:00' 
AND shift_type != 'evening';

-- עדכון תבניות משמרות קיימות
UPDATE shift_templates 
SET shift_type = 'evening'
WHERE start_time >= '16:00:00' AND start_time < '22:00:00' 
AND shift_type != 'evening';

-- עדכון הגדרות סוגי משמרות בעסק
UPDATE business_shift_types 
SET shift_type = 'evening'
WHERE start_time >= '16:00:00' AND start_time < '22:00:00' 
AND shift_type != 'evening';

-- יצירת פונקציה לעדכון אוטומטי של סוג משמרת לפי שעות
CREATE OR REPLACE FUNCTION auto_assign_shift_type()
RETURNS TRIGGER AS $$
BEGIN
  -- קביעת סוג המשמרת לפי שעת התחלה
  IF NEW.start_time >= '06:00:00' AND NEW.start_time < '14:00:00' THEN
    NEW.shift_type = 'morning';
  ELSIF NEW.start_time >= '14:00:00' AND NEW.start_time < '22:00:00' THEN
    NEW.shift_type = 'evening';
  ELSE
    NEW.shift_type = 'night';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- הוספת טריגר לטבלת scheduled_shifts
DROP TRIGGER IF EXISTS auto_assign_shift_type_scheduled ON scheduled_shifts;
CREATE TRIGGER auto_assign_shift_type_scheduled
  BEFORE INSERT OR UPDATE ON scheduled_shifts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_shift_type();

-- הוספת טריגר לטבלת shift_templates
DROP TRIGGER IF EXISTS auto_assign_shift_type_templates ON shift_templates;
CREATE TRIGGER auto_assign_shift_type_templates
  BEFORE INSERT OR UPDATE ON shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_shift_type();

-- הוספת טריגר לטבלת business_shift_types
DROP TRIGGER IF EXISTS auto_assign_shift_type_business ON business_shift_types;
CREATE TRIGGER auto_assign_shift_type_business
  BEFORE INSERT OR UPDATE ON business_shift_types
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_shift_type();