-- תיקון בעיות search_path בפונקציות - חלק 2
-- ממשיך לתקן את הפונקציות הבעייתיות

-- תיקון פונקציית update_document_recipient_counts
CREATE OR REPLACE FUNCTION public.update_document_recipient_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE employee_documents 
    SET recipients_count = recipients_count + 1
    WHERE id = NEW.document_id;
    
    IF NEW.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count + 1
      WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from not signed to signed
    IF OLD.status != 'signed' AND NEW.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count + 1
      WHERE id = NEW.document_id;
    -- If status changed from signed to not signed
    ELSIF OLD.status = 'signed' AND NEW.status != 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count - 1
      WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE employee_documents 
    SET recipients_count = recipients_count - 1
    WHERE id = OLD.document_id;
    
    IF OLD.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count - 1
      WHERE id = OLD.document_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- תיקון פונקציית log_accounting_activity
CREATE OR REPLACE FUNCTION public.log_accounting_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    action_type_val TEXT;
    business_id_val UUID;
BEGIN
    -- קביעת סוג הפעולה
    CASE TG_OP
        WHEN 'INSERT' THEN action_type_val := 'create';
        WHEN 'UPDATE' THEN action_type_val := 'update';
        WHEN 'DELETE' THEN action_type_val := 'delete';
    END CASE;

    -- קבלת business_id מהרשומה
    CASE TG_OP
        WHEN 'DELETE' THEN business_id_val := OLD.business_id;
        ELSE business_id_val := NEW.business_id;
    END CASE;

    -- הוספת רשומה ללוג
    INSERT INTO public.accounting_activity_log (
        business_id,
        action_type,
        table_name,
        record_id,
        user_id,
        old_values,
        new_values
    ) VALUES (
        business_id_val,
        action_type_val,
        TG_TABLE_NAME,
        CASE TG_OP WHEN 'DELETE' THEN OLD.id::TEXT ELSE NEW.id::TEXT END,
        auth.uid(),
        CASE TG_OP WHEN 'DELETE' THEN row_to_json(OLD) WHEN 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE TG_OP WHEN 'DELETE' THEN NULL ELSE row_to_json(NEW) END
    );

    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;