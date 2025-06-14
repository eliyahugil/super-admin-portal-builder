
-- מחיקת כל הקבצים מהדלי לפני מחיקת הדלי עצמו
DELETE FROM storage.objects WHERE bucket_id = 'employee-files';

-- מחיקת מדיניות קיימת לפני מחיקת הדלי
DROP POLICY IF EXISTS "Public read access for employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update employee-files" ON storage.objects;

-- מחיקת הדלי לאחר שמחקנו את כל הקבצים
DELETE FROM storage.buckets WHERE id = 'employee-files';

-- יצירת הדלי מחדש עם הגדרות נכונות
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('employee-files', 'employee-files', true, 52428800, NULL);

-- יצירת מדיניות גישה חדשה
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
