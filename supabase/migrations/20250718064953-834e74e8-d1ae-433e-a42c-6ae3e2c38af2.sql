-- Add super admin policy for employees table
DROP POLICY IF EXISTS "Super admin can access all employees" ON public.employees;

CREATE POLICY "Super admin can access all employees" 
ON public.employees 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);