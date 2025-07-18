-- Add public access policies for token-based authentication

-- Allow public access to shift_submission_tokens table for token validation
CREATE POLICY "Public access to shift tokens for validation" 
ON public.shift_submission_tokens 
FOR SELECT 
TO anon
USING (
  is_active = true 
  AND expires_at > now()
);

-- Allow public access to employees data via valid tokens
CREATE POLICY "Public access to employees via valid tokens" 
ON public.employees 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.shift_submission_tokens 
    WHERE business_id = employees.business_id
      AND is_active = true
      AND expires_at > now()
      AND (employee_id IS NULL OR employee_id = employees.id)
  )
);

-- Allow public access to employee_branch_assignments via valid tokens
CREATE POLICY "Public access to employee_branch_assignments via valid tokens" 
ON public.employee_branch_assignments 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.shift_submission_tokens sst
    JOIN public.employees e ON e.business_id = sst.business_id
    WHERE sst.is_active = true
      AND sst.expires_at > now()
      AND e.id = employee_branch_assignments.employee_id
      AND (sst.employee_id IS NULL OR sst.employee_id = e.id)
  )
);

-- Allow public access to employee_default_preferences via valid tokens
CREATE POLICY "Public access to employee_default_preferences via valid tokens" 
ON public.employee_default_preferences 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.shift_submission_tokens sst
    JOIN public.employees e ON e.business_id = sst.business_id
    WHERE sst.is_active = true
      AND sst.expires_at > now()
      AND e.id = employee_default_preferences.employee_id
      AND (sst.employee_id IS NULL OR sst.employee_id = e.id)
  )
);