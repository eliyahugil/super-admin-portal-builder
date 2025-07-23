-- Critical Security Fixes Phase 2: Fix column references and continue hardening

-- 1. Fix employee documents policy - check correct column structure
DROP POLICY IF EXISTS "Authenticated business members can manage employee documents" ON public.employee_documents;

-- Create proper policy for employee documents based on employee relationship
CREATE POLICY "Authenticated business members can manage employee documents"
ON public.employee_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_documents.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_documents.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
);

-- 2. Create policy for employee document signatures
CREATE POLICY "Authenticated business members can manage employee document signatures"
ON public.employee_document_signatures
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employee_documents ed
    JOIN public.employees e ON e.id = ed.employee_id
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE ed.id = employee_document_signatures.document_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employee_documents ed
    JOIN public.employees e ON e.id = ed.employee_id
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE ed.id = employee_document_signatures.document_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
);

-- 3. Create policy for employee salary history
CREATE POLICY "Authenticated business members can manage employee salary history"
ON public.employee_salary_history
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_salary_history.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_salary_history.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
);

-- 4. Secure custom management tables - check if they have business_id or module relationships
CREATE POLICY "Authenticated super admins can manage custom management"
ON public.custom_management
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Authenticated super admins can manage custom management customers"
ON public.custom_management_customers
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');

-- 5. Fix database functions to include proper search_path security
CREATE OR REPLACE FUNCTION public.get_business_modules(business_id_param uuid)
RETURNS TABLE(module_key text, is_enabled boolean, module_name text, description text, icon text, route_pattern text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    bmc.module_key,
    bmc.is_enabled,
    mc.module_name,
    mc.description,
    mc.icon,
    mc.route_pattern
  FROM public.business_module_config bmc
  JOIN public.modules_config mc ON mc.module_key = bmc.module_key
  WHERE bmc.business_id = business_id_param
    AND mc.enabled_by_superadmin = true;
$function$;

CREATE OR REPLACE FUNCTION public.check_business_module_access(business_id_param uuid, module_key_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.business_module_subscriptions bms
    WHERE bms.business_id = business_id_param
      AND bms.module_key = module_key_param
      AND bms.is_active = true
      AND (bms.end_date IS NULL OR bms.end_date >= CURRENT_DATE)
      AND bms.start_date <= CURRENT_DATE
  );
$function$;

-- 6. Restrict anonymous access to key system tables by updating policies to require authentication
DROP POLICY IF EXISTS "Allow all to read modules_config" ON public.modules_config;
CREATE POLICY "Authenticated users can read modules config"
ON public.modules_config
FOR SELECT
TO authenticated
USING (true);

-- Only super admin can modify modules config (keep existing policy but ensure it's for authenticated users)
DROP POLICY IF EXISTS "Only super_admin can modify modules_config" ON public.modules_config;
CREATE POLICY "Only super admin can modify modules config"
ON public.modules_config
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');