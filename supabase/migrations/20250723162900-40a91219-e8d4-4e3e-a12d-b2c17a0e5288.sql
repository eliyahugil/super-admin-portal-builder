-- Security Fixes Phase 3: Fix remaining function search paths and remove all old anonymous policies

-- Fix all remaining functions to include proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_shift_assignments()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_token_submission_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shift_submission_tokens 
    SET current_submissions = current_submissions + 1
    WHERE id = NEW.token_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shift_submission_tokens 
    SET current_submissions = current_submissions - 1
    WHERE id = OLD.token_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_business_registration_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  code_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code_length INTEGER := 8;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := '';
    FOR i IN 1..code_length LOOP
      new_code := new_code || substr(code_chars, floor(random() * length(code_chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.business_registration_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_business_by_registration_code(code_param text)
RETURNS TABLE(business_id uuid, business_name text, code_is_active boolean, code_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as business_id,
    b.name as business_name,
    brc.is_active as code_is_active,
    (brc.is_active AND (brc.max_usage IS NULL OR brc.usage_count < brc.max_usage)) as code_valid
  FROM public.business_registration_codes brc
  JOIN public.businesses b ON b.id = brc.business_id
  WHERE brc.code = code_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_registration_code_usage(code_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.business_registration_codes 
  SET usage_count = usage_count + 1
  WHERE code = code_param;
END;
$function$;

-- Remove all remaining old anonymous policies
DROP POLICY IF EXISTS "Allow all operations on custom_field_values" ON public.custom_field_values;
DROP POLICY IF EXISTS "Allow all operations on custom_management" ON public.custom_management;
DROP POLICY IF EXISTS "Allow all operations on custom_management_customers" ON public.custom_management_customers;
DROP POLICY IF EXISTS "Allow all operations on employee_branch_assignments" ON public.employee_branch_assignments;
DROP POLICY IF EXISTS "Allow all operations on employee_shift_requests" ON public.employee_shift_requests;
DROP POLICY IF EXISTS "Allow all operations on employee_document_signatures" ON public.employee_document_signatures;
DROP POLICY IF EXISTS "Allow all operations on employee_documents" ON public.employee_documents;
DROP POLICY IF EXISTS "Allow all operations on employee_salary_history" ON public.employee_salary_history;
DROP POLICY IF EXISTS "Allow all operations on customer_numbers" ON public.customer_numbers;
DROP POLICY IF EXISTS "Allow all operations on module_data" ON public.module_data;
DROP POLICY IF EXISTS "Allow all operations on module_fields" ON public.module_fields;
DROP POLICY IF EXISTS "Allow all operations on sub_modules" ON public.sub_modules;
DROP POLICY IF EXISTS "Allow all operations on integration_audit_log" ON public.integration_audit_log;

-- Remove dangerous profiles policies that allow anonymous access
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;

-- Continue fixing more functions
CREATE OR REPLACE FUNCTION public.mark_all_shifts_as_seen(business_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;