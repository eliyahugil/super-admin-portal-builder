
-- בדיקה אם הדלי קיים ומחיקתו אם כן
DO $$
BEGIN
    -- מחיקת קבצים קיימים
    DELETE FROM storage.objects WHERE bucket_id = 'employee-files';
    
    -- מחיקת מדיניות קיימת
    DROP POLICY IF EXISTS "Public read access for employee-files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload to employee-files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete from employee-files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update employee-files" ON storage.objects;
    
    -- מחיקת הדלי
    DELETE FROM storage.buckets WHERE id = 'employee-files';
END $$;

-- יצירת הדלי מחדש בבלוק נפרד
DO $$
BEGIN
    -- יצירת הדלי
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('employee-files', 'employee-files', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
    
    -- יצירת מדיניות גישה
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
END $$;
