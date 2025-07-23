-- PHASE 4: Complete Security Implementation 

-- 1. Strengthen super admin role enforcement by updating the user creation trigger
-- to ensure only the authorized email can get super_admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Add a small delay to ensure user data is fully committed
  PERFORM pg_sleep(0.1);
  
  INSERT INTO public.profiles (id, email, full_name, phone, role, business_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    CASE 
      -- CRITICAL SECURITY: Only this specific email can be super_admin
      WHEN new.email = 'eligil1308@gmail.com' THEN 'super_admin'::user_role
      -- All other users get business_admin role
      ELSE 'business_admin'::user_role
    END,
    -- No automatic business assignment for new users
    NULL
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Still try to create a basic profile with restricted role
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, phone, role, business_id)
      VALUES (new.id, new.email, '', '', 'business_admin'::user_role, NULL);
    EXCEPTION
      WHEN OTHERS THEN
        -- If this also fails, just log and continue
        RAISE LOG 'Failed to create fallback profile: %', SQLERRM;
    END;
    RETURN new;
END;
$function$;

-- 2. Add additional role escalation protection
-- Prevent users from updating their own role to super_admin
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Prevent role escalation attempts
  IF OLD.role != 'super_admin' AND NEW.role = 'super_admin' THEN
    -- Only allow if the user is the authorized super admin OR current user is already super admin
    IF NEW.email != 'eligil1308@gmail.com' AND 
       (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'super_admin' THEN
      RAISE EXCEPTION 'Role escalation not permitted';
    END IF;
  END IF;
  
  -- Prevent super admin from being downgraded unless done by themselves
  IF OLD.role = 'super_admin' AND NEW.role != 'super_admin' THEN
    IF auth.uid() != OLD.id AND OLD.email = 'eligil1308@gmail.com' THEN
      RAISE EXCEPTION 'Cannot modify super admin role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role escalation protection
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 3. Ensure the authorized super admin has correct role
UPDATE public.profiles 
SET role = 'super_admin'::user_role 
WHERE email = 'eligil1308@gmail.com' AND role != 'super_admin';

-- 4. Ensure all other users are NOT super admin (except the authorized one)
UPDATE public.profiles 
SET role = 'business_admin'::user_role 
WHERE email != 'eligil1308@gmail.com' AND role = 'super_admin';

-- 5. Add more function security improvements
CREATE OR REPLACE FUNCTION public.clone_employees_to_business(from_business_id uuid, to_business_id uuid, created_by_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  employee_record record;
  cloned_count integer := 0;
  error_count integer := 0;
  result jsonb;
BEGIN
  -- Verify user has access to both businesses
  IF NOT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = from_business_id AND owner_id = created_by_user_id
  ) OR NOT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = to_business_id AND owner_id = created_by_user_id
  ) THEN
    RAISE EXCEPTION 'Access denied to one or both businesses';
  END IF;

  -- Clone employees
  FOR employee_record IN 
    SELECT * FROM public.employees 
    WHERE business_id = from_business_id AND is_active = true
  LOOP
    BEGIN
      INSERT INTO public.employees (
        business_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        employee_type,
        hire_date,
        weekly_hours_required,
        notes,
        employee_id
      ) VALUES (
        to_business_id,
        employee_record.first_name,
        employee_record.last_name,
        employee_record.email,
        employee_record.phone,
        employee_record.address,
        employee_record.employee_type,
        employee_record.hire_date,
        employee_record.weekly_hours_required,
        COALESCE(employee_record.notes, '') || E'\n\nשוכפל מעסק אחר בתאריך: ' || now()::date,
        employee_record.employee_id
      );
      
      cloned_count := cloned_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
    END;
  END LOOP;

  result := jsonb_build_object(
    'success', true,
    'cloned_count', cloned_count,
    'error_count', error_count,
    'message', format('Successfully cloned %s employees, %s errors', cloned_count, error_count)
  );

  RETURN result;
END;
$function$;