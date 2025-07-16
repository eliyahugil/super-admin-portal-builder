-- עדכון פונקציה לסימון כל המשמרות כנצפות לטבלה הנכונה
CREATE OR REPLACE FUNCTION mark_all_shifts_as_seen(business_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.scheduled_shifts 
    SET is_new = false 
    WHERE business_id = business_id_param 
      AND is_new = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;