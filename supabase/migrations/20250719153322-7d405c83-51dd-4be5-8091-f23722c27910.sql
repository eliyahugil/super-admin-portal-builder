-- Create function to check for overlapping shifts
CREATE OR REPLACE FUNCTION check_overlapping_shifts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's already an overlapping shift for this employee
  IF EXISTS (
    SELECT 1 
    FROM scheduled_shifts 
    WHERE employee_id = NEW.employee_id 
      AND shift_date = NEW.shift_date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
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
    RAISE EXCEPTION 'Employee already has an overlapping shift on this date and time';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent overlapping shifts
DROP TRIGGER IF EXISTS trigger_check_overlapping_shifts ON scheduled_shifts;
CREATE TRIGGER trigger_check_overlapping_shifts
  BEFORE INSERT OR UPDATE ON scheduled_shifts
  FOR EACH ROW EXECUTE FUNCTION check_overlapping_shifts();