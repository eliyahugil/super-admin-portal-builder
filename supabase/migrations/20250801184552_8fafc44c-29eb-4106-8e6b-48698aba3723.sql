-- תיקון בעיית search_path בפונקציית check_overlapping_shifts
CREATE OR REPLACE FUNCTION public.check_overlapping_shifts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Skip overlap check if manager override is enabled
  IF NEW.manager_override = true THEN
    RETURN NEW;
  END IF;
  
  -- Check if there's already an overlapping shift for this employee
  IF EXISTS (
    SELECT 1 
    FROM scheduled_shifts 
    WHERE employee_id = NEW.employee_id 
      AND shift_date = NEW.shift_date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND manager_override = false  -- Only check non-overridden shifts
      AND (
        -- New shift starts during existing shift
        (NEW.start_time >= start_time AND NEW.start_time < end_time)
        OR
        -- New shift ends during existing shift  
        (NEW.end_time > start_time AND NEW.end_time <= end_time)
        OR
        -- New shift completely contains existing shift
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Employee already has an overlapping shift on this date and time. Use manager override to approve.';
  END IF;
  
  -- Set override metadata if override is enabled
  IF NEW.manager_override = true AND OLD.manager_override IS DISTINCT FROM NEW.manager_override THEN
    NEW.override_by = auth.uid();
    NEW.override_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;