-- Make sure the employee-files bucket exists and is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'employee-files';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('employee-files', 'employee-files', true, 52428800, ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Update storage policies to allow public access
DROP POLICY IF EXISTS "Public read access for employee files" ON storage.objects;
CREATE POLICY "Public read access for employee files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'employee-files');

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload employee files" ON storage.objects;
CREATE POLICY "Authenticated users can upload employee files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update their files
DROP POLICY IF EXISTS "Authenticated users can update employee files" ON storage.objects;
CREATE POLICY "Authenticated users can update employee files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete their files
DROP POLICY IF EXISTS "Authenticated users can delete employee files" ON storage.objects;
CREATE POLICY "Authenticated users can delete employee files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'employee-files' AND auth.uid() IS NOT NULL);