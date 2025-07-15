-- Fix critical security issue - make bucket private and secure
UPDATE storage.buckets 
SET public = false 
WHERE id = 'employee-files';

-- Remove all existing public policies
DROP POLICY IF EXISTS "Public read access for employee files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload employee files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update employee files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete employee files" ON storage.objects;

-- Create secure policies that require authentication and business ownership
CREATE POLICY "Business members can view employee files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'employee-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM employee_files ef
    WHERE ef.file_path = name
    AND ef.business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
);

-- Allow business members to upload files
CREATE POLICY "Business members can upload employee files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'employee-files' 
  AND auth.uid() IS NOT NULL
);

-- Allow business members to update their files
CREATE POLICY "Business members can update employee files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'employee-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM employee_files ef
    WHERE ef.file_path = name
    AND ef.business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
);

-- Allow business members to delete their files
CREATE POLICY "Business members can delete employee files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'employee-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM employee_files ef
    WHERE ef.file_path = name
    AND ef.business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
);