-- Add RLS policy to allow deletion of shift submissions for business users
CREATE POLICY "Users can delete shift submissions for their business employees" 
ON public.shift_submissions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = shift_submissions.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);