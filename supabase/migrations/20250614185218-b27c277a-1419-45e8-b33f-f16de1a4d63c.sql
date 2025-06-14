
-- יצירת דלי האחסון employee-files
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-files', 'employee-files', true)
ON CONFLICT (id) DO NOTHING;

-- מחיקת מדיניות קיימת אם יש
DROP POLICY IF EXISTS "Public read access for employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from employee-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update employee-files" ON storage.objects;

-- יצירת מדיניות גישה ציבורית לקריאה
CREATE POLICY "Public read access for employee-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'employee-files');

-- יצירת מדיניות העלאה למשתמשים מחוברים
CREATE POLICY "Authenticated users can upload to employee-files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'employee-files'
  AND auth.role() = 'authenticated'
);

-- יצירת מדיניות מחיקה למשתמשים מחוברים
CREATE POLICY "Authenticated users can delete from employee-files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'employee-files'
  AND auth.role() = 'authenticated'
);

-- יצירת מדיניות עדכון למשתמשים מחוברים
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
