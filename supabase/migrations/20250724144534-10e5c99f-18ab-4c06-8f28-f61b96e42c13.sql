-- Add full RLS policies for employee_branch_assignments table
DROP POLICY IF EXISTS "Users can manage employee branch assignments for their businesses" ON public.employee_branch_assignments;
DROP POLICY IF EXISTS "Service role can access employee_branch_assignments" ON public.employee_branch_assignments;

-- Allow users to manage employee branch assignments for their businesses
CREATE POLICY "Users can manage employee branch assignments for their businesses" 
ON public.employee_branch_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_branch_assignments.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_branch_assignments.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- Allow service role full access for edge functions
CREATE POLICY "Service role can access employee_branch_assignments" 
ON public.employee_branch_assignments 
FOR ALL 
USING (true)
WITH CHECK (true);