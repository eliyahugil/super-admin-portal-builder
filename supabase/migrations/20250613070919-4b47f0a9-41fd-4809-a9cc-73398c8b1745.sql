
-- First, let's check and fix the RLS policies for the employees table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view employees of their business" ON public.employees;
DROP POLICY IF EXISTS "Users can create employees for their business" ON public.employees;
DROP POLICY IF EXISTS "Users can update employees of their business" ON public.employees;
DROP POLICY IF EXISTS "Users can delete employees of their business" ON public.employees;

-- Create comprehensive RLS policies for employees table
-- Policy for SELECT operations
CREATE POLICY "Users can view employees of their business" 
  ON public.employees 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Policy for INSERT operations
CREATE POLICY "Users can create employees for their business" 
  ON public.employees 
  FOR INSERT 
  WITH CHECK (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Policy for UPDATE operations
CREATE POLICY "Users can update employees of their business" 
  ON public.employees 
  FOR UPDATE 
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Policy for DELETE operations
CREATE POLICY "Users can delete employees of their business" 
  ON public.employees 
  FOR DELETE 
  USING (
    business_id IN (
      SELECT b.id FROM public.businesses b 
      WHERE b.owner_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );
