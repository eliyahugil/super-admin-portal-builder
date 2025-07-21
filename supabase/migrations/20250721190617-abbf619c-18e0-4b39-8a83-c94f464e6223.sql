-- Fix the INSERT policy for employee_files table
DROP POLICY "Business members can insert employee files" ON public.employee_files;

-- Create corrected INSERT policy that includes check for business membership
CREATE POLICY "Business members can insert employee files" 
ON public.employee_files 
FOR INSERT 
WITH CHECK (
  (business_id IN (
    SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid()
  )) OR 
  (business_id IN (
    SELECT p.business_id FROM profiles p 
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  )) OR 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
);