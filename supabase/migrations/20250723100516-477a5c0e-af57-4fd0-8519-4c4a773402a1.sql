-- Critical Security Fixes: Restrict Anonymous Access and Fix RLS Policies

-- Phase 1: Remove dangerous anonymous access policies and implement proper authenticated-only access

-- 1. Fix overly permissive "Allow all operations" policies
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

-- 2. Create secure authenticated-only policies for custom field values
CREATE POLICY "Authenticated users can manage custom field values for their business employees"
ON public.custom_field_values
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = custom_field_values.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = custom_field_values.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
);

-- 3. Create secure policies for employee branch assignments
CREATE POLICY "Authenticated users can manage employee branch assignments for their business"
ON public.employee_branch_assignments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_branch_assignments.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_branch_assignments.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
);

-- 4. Secure employee shift requests
CREATE POLICY "Authenticated users can manage shift requests for their business employees"
ON public.employee_shift_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_shift_requests.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.profiles p ON p.business_id = e.business_id
    WHERE e.id = employee_shift_requests.employee_id
    AND p.id = auth.uid()
  ) OR public.get_current_user_role() = 'super_admin'
);

-- 5. Secure employee documents
CREATE POLICY "Authenticated business members can manage employee documents"
ON public.employee_documents
FOR ALL
TO authenticated
USING (
  business_id = ANY(public.get_user_business_ids()) OR
  public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  business_id = ANY(public.get_user_business_ids()) OR
  public.get_current_user_role() = 'super_admin'
);

-- 6. Secure customer numbers
CREATE POLICY "Authenticated users can manage customer numbers for their business"
ON public.customer_numbers
FOR ALL
TO authenticated
USING (
  business_id = ANY(public.get_user_business_ids()) OR
  public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  business_id = ANY(public.get_user_business_ids()) OR
  public.get_current_user_role() = 'super_admin'
);

-- 7. Secure modules configuration - only super admin should manage these
CREATE POLICY "Only super admin can manage module data"
ON public.module_data
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Only super admin can manage module fields"
ON public.module_fields
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Only super admin can manage sub modules"
ON public.sub_modules
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');

-- 8. Restrict access to system-level tables
CREATE POLICY "Only super admin can manage integration audit log"
ON public.integration_audit_log
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'super_admin')
WITH CHECK (public.get_current_user_role() = 'super_admin');

-- 9. Restrict profiles access to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 10. Remove dangerous anonymous access from all business-related tables
-- Update all remaining policies to require authentication
DROP POLICY IF EXISTS "Users can view all activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can view activity logs for their businesses"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  public.get_current_user_role() = 'super_admin'
);

-- Continue with more restrictive policies for key tables...