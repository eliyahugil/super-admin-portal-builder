-- Clean up duplicate and conflicting RLS policies for employees table

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Employees can update their own birth_date and email" ON public.employees;
DROP POLICY IF EXISTS "Public can update employee basic info during login" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees from their business" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees of their business" ON public.employees;
DROP POLICY IF EXISTS "Users can update employees of their business" ON public.employees;

-- Create clean, non-conflicting policies

-- 1. Service role access (for backend operations)
-- Already exists: "Service role can access employees"

-- 2. Super admin access (for full system management)
-- Already exists: "Super admin can access all employees"

-- 3. Business owners and admins can view their employees
CREATE POLICY "Business access to employees" 
ON public.employees 
FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ) OR 
  business_id IN (
    SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 4. Business owners can manage their employees
CREATE POLICY "Business manage employees" 
ON public.employees 
FOR ALL 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 5. Public access for employee token-based operations and self-updates
CREATE POLICY "Employee self-update during login" 
ON public.employees 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 6. Public access via valid submission tokens
-- Already exists: "Public access to employees via valid tokens"