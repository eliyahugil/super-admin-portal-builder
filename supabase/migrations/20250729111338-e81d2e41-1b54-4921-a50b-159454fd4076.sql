-- תיקון בעיית search_path בפונקציית get_employee_shift_preferences
-- פונקציה קריטית להגשת משמרות - חובה להגן עליה מפני התקפות search_path

CREATE OR REPLACE FUNCTION public.get_employee_shift_preferences(employee_id_param uuid, branch_id_param uuid DEFAULT NULL::uuid)
RETURNS TABLE(available_days integer[], shift_types text[], max_weekly_hours integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  branch_preferences RECORD;
  default_preferences RECORD;
BEGIN
  -- First, try to get branch-specific preferences
  IF branch_id_param IS NOT NULL THEN
    SELECT ba.available_days, ba.shift_types, ba.max_weekly_hours
    INTO branch_preferences
    FROM public.employee_branch_assignments ba
    WHERE ba.employee_id = employee_id_param 
      AND ba.branch_id = branch_id_param 
      AND ba.is_active = true
    LIMIT 1;
    
    -- If found branch-specific preferences, return them
    IF FOUND THEN
      RETURN QUERY SELECT 
        branch_preferences.available_days,
        branch_preferences.shift_types,
        branch_preferences.max_weekly_hours;
      RETURN;
    END IF;
  END IF;
  
  -- If no branch-specific preferences, get default preferences
  SELECT edp.available_days, edp.shift_types, edp.max_weekly_hours
  INTO default_preferences
  FROM public.employee_default_preferences edp
  WHERE edp.employee_id = employee_id_param
  LIMIT 1;
  
  -- If found default preferences, return them
  IF FOUND THEN
    RETURN QUERY SELECT 
      default_preferences.available_days,
      default_preferences.shift_types,
      default_preferences.max_weekly_hours;
    RETURN;
  END IF;
  
  -- If no preferences found at all, return defaults
  RETURN QUERY SELECT 
    ARRAY[0,1,2,3,4,5,6]::INTEGER[],
    ARRAY['morning','evening']::TEXT[],
    40::INTEGER;
END;
$function$;