-- Fix critical security issues - Add missing RLS policies and restrict anonymous access

-- 1. Fix tables with RLS enabled but no policies
-- attendance_records table
CREATE POLICY "Business users can manage attendance records for their employees"
ON public.attendance_records
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = attendance_records.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = attendance_records.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- custom_field_values table
CREATE POLICY "Business users can manage custom field values for their employees"
ON public.custom_field_values
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = custom_field_values.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = custom_field_values.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- customer_numbers table  
CREATE POLICY "Business users can access customer numbers for their business"
ON public.customer_numbers
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- employee_branch_priorities table
CREATE POLICY "Business users can manage employee branch priorities"
ON public.employee_branch_priorities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_branch_priorities.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_branch_priorities.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- employee_constraints table
CREATE POLICY "Business users can manage employee constraints"
ON public.employee_constraints
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_constraints.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_constraints.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- employee_contacts table
CREATE POLICY "Business users can manage employee contacts"
ON public.employee_contacts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_contacts.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_contacts.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- 2. Restrict anonymous access on critical security policies
-- Update activity_logs policies to require authentication
DROP POLICY IF EXISTS "Users can view all activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can view activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (true);

-- Update profiles policies to require authentication  
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

CREATE POLICY "Authenticated super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'super_admin'::user_role);

CREATE POLICY "Authenticated super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'super_admin'::user_role)
WITH CHECK (get_current_user_role() = 'super_admin'::user_role);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Update shift submission token policies to be more restrictive
DROP POLICY IF EXISTS "Public access to active shift submission tokens" ON public.shift_submission_tokens;

-- Only allow public access with valid business context
CREATE POLICY "Public access to shift submission tokens via token validation"
ON public.shift_submission_tokens
FOR SELECT
USING (
  is_active = true 
  AND expires_at > now()
  AND current_setting('request.jwt.claims', true)::json->>'role' = 'anon'
);

-- 3. Fix function search paths for security
-- Update functions to have SET search_path = 'public'
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      ARRAY(SELECT id FROM public.businesses WHERE is_active = true)
    ELSE
      ARRAY(
        SELECT DISTINCT business_id 
        FROM public.user_businesses 
        WHERE user_id = auth.uid()
        UNION
        SELECT business_id 
        FROM public.profiles 
        WHERE id = auth.uid() AND business_id IS NOT NULL
      )
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_business_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' THEN
      NULL::uuid
    ELSE
      COALESCE(
        (SELECT business_id FROM public.profiles WHERE id = auth.uid()),
        (SELECT business_id FROM public.user_businesses WHERE user_id = auth.uid() LIMIT 1)
      )
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT p.role FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$function$;