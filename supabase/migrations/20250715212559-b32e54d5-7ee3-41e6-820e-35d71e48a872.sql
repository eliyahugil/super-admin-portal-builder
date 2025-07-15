-- Update storage bucket to be public for file access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'employee-files';

-- Update storage policies to allow authenticated users to upload
DROP POLICY IF EXISTS "Business members can insert employee files" ON storage.objects;
CREATE POLICY "Authenticated users can upload employee files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to read files
DROP POLICY IF EXISTS "Public read access for employee-files" ON storage.objects;
CREATE POLICY "Authenticated users can read employee files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update files
DROP POLICY IF EXISTS "Authenticated users can update employee files" ON storage.objects;
CREATE POLICY "Authenticated users can update employee files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete files
DROP POLICY IF EXISTS "Authenticated users can delete employee files" ON storage.objects;
CREATE POLICY "Authenticated users can delete employee files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);