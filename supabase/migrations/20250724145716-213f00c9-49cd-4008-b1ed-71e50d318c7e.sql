-- Fix RLS policies for employee_branch_assignments to work properly with JOINs
DROP POLICY IF EXISTS "Public access to employee_branch_assignments via valid tokens" ON public.employee_branch_assignments;
DROP POLICY IF EXISTS "Users can manage employee branch assignments for their businesses" ON public.employee_branch_assignments;
DROP POLICY IF EXISTS "Service role can access employee_branch_assignments" ON public.employee_branch_assignments;

-- Create a comprehensive policy that allows access based on business context
CREATE POLICY "Allow access to employee_branch_assignments for business users" 
ON public.employee_branch_assignments 
FOR ALL 
USING (
  -- Allow if user has access to the business that the employee belongs to
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_branch_assignments.employee_id 
    AND (
      e.business_id = ANY (get_user_business_ids()) OR 
      -- Allow service role for edge functions
      current_setting('role') = 'service_role'
    )
  )
)
WITH CHECK (
  -- Same check for inserts/updates
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_branch_assignments.employee_id 
    AND (
      e.business_id = ANY (get_user_business_ids()) OR 
      current_setting('role') = 'service_role'
    )
  )
);

-- Also allow public access via valid tokens for shift submission
CREATE POLICY "Public access to employee_branch_assignments via valid tokens" 
ON public.employee_branch_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM (shift_submission_tokens sst
      JOIN employees e ON ((e.business_id = sst.business_id)))
    WHERE ((sst.is_active = true) AND (sst.expires_at > now()) AND (e.id = employee_branch_assignments.employee_id) AND ((sst.employee_id IS NULL) OR (sst.employee_id = e.id)))
  )
);