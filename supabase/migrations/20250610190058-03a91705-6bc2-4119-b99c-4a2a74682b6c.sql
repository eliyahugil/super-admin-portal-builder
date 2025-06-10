
-- Only create the storage policies if they don't exist
-- First, let's check and create the storage policies for the employee-files bucket

-- Allow authenticated users to upload files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload files'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'employee-files' AND
          auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- Allow authenticated users to view files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to view files'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Allow authenticated users to view files" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'employee-files' AND
          auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- Allow authenticated users to update files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to update files'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Allow authenticated users to update files" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'employee-files' AND
          auth.role() = 'authenticated'
        ) WITH CHECK (
          bucket_id = 'employee-files' AND
          auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- Allow authenticated users to delete files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated users to delete files'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'employee-files' AND
          auth.role() = 'authenticated'
        );
    END IF;
END $$;
