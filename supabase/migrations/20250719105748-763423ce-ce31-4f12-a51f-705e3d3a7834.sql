-- הוספת שדות חדשים לטבלת המשמרות לתמיכה בהקצאות מרובות
ALTER TABLE public.scheduled_shifts 
ADD COLUMN IF NOT EXISTS shift_assignments JSONB DEFAULT '[]'::jsonb;

-- הוספת אינדקס לביצועים טובים יותר
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_assignments 
ON public.scheduled_shifts USING GIN(shift_assignments);

-- הוספת הערה להסבר השדה החדש
COMMENT ON COLUMN public.scheduled_shifts.shift_assignments IS 'מערך של הקצאות עובדים למשמרת, כל אחת עם סוג (חובה/תגבור) ועובד מוקצה';

-- פונקציה עזר לעדכון הקצאות
CREATE OR REPLACE FUNCTION update_shift_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- אם אין הקצאות, צור הקצאה ראשונית
  IF NEW.shift_assignments IS NULL OR jsonb_array_length(NEW.shift_assignments) = 0 THEN
    NEW.shift_assignments = jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'type', 'חובה',
        'employee_id', NEW.employee_id,
        'position', 1,
        'is_required', true
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;