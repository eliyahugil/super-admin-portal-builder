-- הוספת שדה is_new לטבלת scheduled_shifts כדי לזהות משמרות חדשות
ALTER TABLE public.scheduled_shifts 
ADD COLUMN is_new BOOLEAN DEFAULT true;

-- הוספת אינדקס לביצועים טובים יותר
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_is_new 
ON public.scheduled_shifts(is_new);

-- עדכון משמרות קיימות להיות לא חדשות
UPDATE public.scheduled_shifts 
SET is_new = false 
WHERE created_at < NOW() - INTERVAL '1 hour';

-- יצירת פונקציה לסימון כל המשמרות כלא חדשות
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