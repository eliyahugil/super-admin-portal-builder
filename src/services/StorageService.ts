
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  private static readonly BUCKET_NAME = 'employee-files';

  static async uploadEmployeeFile(file: File, userId: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const fileName = `employee-imports/${userId}/${timestamp}-${file.name}`;

      console.log('📤 Attempting to upload file to bucket:', this.BUCKET_NAME, 'Path:', fileName);

      // ניסיון העלאה ישירות ל-bucket (מניחים שהוא קיים)
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
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
        .from(this.BUCKET_NAME)
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

  static async checkBucketAccess(): Promise<boolean> {
    try {
      // בדיקה פשוטה אם יש גישה ל-bucket
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list('', {
        limit: 1
      });

      if (error) {
        console.warn('⚠️ Bucket access check failed:', error.message);
        return false;
      }

      console.log('✅ Bucket access confirmed');
      return true;
    } catch (error) {
      console.warn('⚠️ Error checking bucket access:', error);
      return false;
    }
  }
}
