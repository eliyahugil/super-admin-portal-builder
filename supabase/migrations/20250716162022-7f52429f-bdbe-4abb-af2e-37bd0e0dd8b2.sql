-- Add INSERT policy for employee_quick_add_tokens
CREATE POLICY "Users can create tokens for their businesses"
ON public.employee_quick_add_tokens
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  ) AND 
  created_by = auth.uid()
);