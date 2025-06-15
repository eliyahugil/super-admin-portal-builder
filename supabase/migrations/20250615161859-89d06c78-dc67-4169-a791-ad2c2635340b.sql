
-- יצירת דלי employee-files עם מדיניות נכונה
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('employee-files', 'employee-files', true, 52428800, ARRAY[
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- מחיקת מדיניות קיימת אם יש
DROP POLICY IF EXISTS "Public read access for employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update employee-files" ON storage.objects;

-- יצירת מדיניות גישה לדלי
CREATE POLICY "Public read access for employee-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'employee-files');

CREATE POLICY "Authenticated users can upload to employee-files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'employee-files'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from employee-files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'employee-files'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update employee-files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'employee-files'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'employee-files'
  AND auth.role() = 'authenticated'
);
