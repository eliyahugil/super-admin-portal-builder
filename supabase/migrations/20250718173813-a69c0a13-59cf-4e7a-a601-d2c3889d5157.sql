-- פונקציה לטיפול אוטומטי במשמרות של עובדים בארכיון
CREATE OR REPLACE FUNCTION public.handle_employee_archiving()
RETURNS TRIGGER AS $$
BEGIN
  -- אם העובד הועבר לארכיון
  IF NEW.is_archived = true AND OLD.is_archived = false THEN
    
    -- מחיקת כל המשמרות העתידיות של העובד
    DELETE FROM public.scheduled_shifts 
    WHERE employee_id = NEW.id 
    AND shift_date >= CURRENT_DATE;
    
    -- מחיקת כל הבקשות להגשת משמרות של העובד
    DELETE FROM public.employee_shift_requests 
    WHERE employee_id = NEW.id;
    
    -- מחיקת כל הטוקנים של העובד
    DELETE FROM public.shift_submission_tokens 
    WHERE employee_id = NEW.id;
    
    -- הוספת רשומה ללוג פעילות
    INSERT INTO public.activity_logs (
      user_id,
      action,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      'archive_employee_cleanup',
      'employee',
      NEW.id::text,
      jsonb_build_object(
        'employee_name', NEW.first_name || ' ' || NEW.last_name,
        'shifts_deleted', 'yes',
        'requests_deleted', 'yes'
      )
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- יצירת טריגר לטיפול אוטומטי במשמרות עובדים בארכיון
DROP TRIGGER IF EXISTS trigger_handle_employee_archiving ON public.employees;
CREATE TRIGGER trigger_handle_employee_archiving
  AFTER UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_archiving();

-- ניקוי משמרות קיימות של עובדים בארכיון (תיקון רטרואקטיבי)
DELETE FROM public.scheduled_shifts 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE is_archived = true
) AND shift_date >= CURRENT_DATE;

-- ניקוי בקשות להגשת משמרות של עובדים בארכיון
DELETE FROM public.employee_shift_requests 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE is_archived = true
);

-- ניקוי טוקנים של עובדים בארכיון
DELETE FROM public.shift_submission_tokens 
WHERE employee_id IN (
  SELECT id FROM public.employees 
  WHERE is_archived = true
);