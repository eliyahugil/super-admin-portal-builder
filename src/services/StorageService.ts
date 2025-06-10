
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async createEmployeeFilesBucket() {
    try {
      // First, check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('⚠️ Could not list buckets, assuming bucket exists:', listError);
        return null; // Continue anyway
      }

      const bucketExists = existingBuckets?.some(bucket => bucket.name === 'employee-files');
      
      if (bucketExists) {
        console.log('✅ Employee files bucket already exists');
        return null;
      }

      // Try to create bucket, but don't fail if we can't
      const { data, error } = await supabase.storage.createBucket('employee-files', {
        public: false,
        allowedMimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.warn('⚠️ Could not create bucket (this might be expected):', error);
        // Don't throw error, continue with upload attempt
        return null;
      }

      console.log('✅ Employee files bucket created successfully');
      return data;
    } catch (error) {
      console.warn('⚠️ Error in bucket creation (continuing anyway):', error);
      // Don't throw, let upload attempt proceed
      return null;
    }
  }

  static async uploadEmployeeFile(file: File, userId: string): Promise<string> {
    try {
      // Try to ensure bucket exists (but don't fail if we can't create it)
      await this.createEmployeeFilesBucket();

      const timestamp = new Date().toISOString();
      const fileName = `employee-imports/${userId}/${timestamp}-${file.name}`;

      console.log('📤 Attempting to upload file to employee-files bucket:', fileName);

      const { data, error } = await supabase.storage
        .from('employee-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload failed:', error);
        throw error;
      }

      console.log('✅ File uploaded successfully:', fileName);
      return fileName;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  static async getFileUrl(filePath: string): Promise<string> {
    try {
      const { data } = await supabase.storage
        .from('employee-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (!data?.signedUrl) {
        throw new Error('Failed to create signed URL');
      }

      return data.signedUrl;
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }
}
