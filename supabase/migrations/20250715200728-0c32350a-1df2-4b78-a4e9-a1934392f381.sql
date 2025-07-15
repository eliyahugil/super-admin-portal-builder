-- Enable RLS on employee_files table
ALTER TABLE employee_files ENABLE ROW LEVEL SECURITY;

-- Policy for business members to view files of their business employees
CREATE POLICY "Business members can view employee files" 
ON employee_files 
FOR SELECT 
USING (
  business_id IN (
    SELECT b.id
    FROM businesses b
    WHERE b.owner_id = auth.uid()
  ) OR
  business_id IN (
    SELECT p.business_id
    FROM profiles p
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy for business members to insert files for their business employees
CREATE POLICY "Business members can insert employee files" 
ON employee_files 
FOR INSERT 
WITH CHECK (
  business_id IN (
    SELECT b.id
    FROM businesses b
    WHERE b.owner_id = auth.uid()
  ) OR
  business_id IN (
    SELECT p.business_id
    FROM profiles p
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy for business members to update files of their business employees
CREATE POLICY "Business members can update employee files" 
ON employee_files 
FOR UPDATE 
USING (
  business_id IN (
    SELECT b.id
    FROM businesses b
    WHERE b.owner_id = auth.uid()
  ) OR
  business_id IN (
    SELECT p.business_id
    FROM profiles p
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy for business members to delete files of their business employees
CREATE POLICY "Business members can delete employee files" 
ON employee_files 
FOR DELETE 
USING (
  business_id IN (
    SELECT b.id
    FROM businesses b
    WHERE b.owner_id = auth.uid()
  ) OR
  business_id IN (
    SELECT p.business_id
    FROM profiles p
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);