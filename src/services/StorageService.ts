
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  private static readonly BUCKET_NAME = 'employee-files';

  static async checkBucketAccess(): Promise<boolean> {
    try {
      console.log('🔍 Checking bucket access for:', this.BUCKET_NAME);
      
      // Try to list files in the bucket - this will test both bucket existence and policies
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list('', {
        limit: 1
      });

      if (error) {
        console.warn('⚠️ Bucket access check failed:', error.message);
        return false;
      }

      console.log('✅ Bucket access confirmed - bucket is accessible and policies are working');
      return true;
    } catch (error) {
      console.warn('⚠️ Error checking bucket access:', error);
      return false;
    }
  }

  static async uploadEmployeeFile(file: File, userId: string): Promise<string> {
    try {
      // Check if bucket is accessible
      const hasAccess = await this.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה כרגע. אנא נסה שוב מאוחר יותר.');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `employee-imports/${userId}/${timestamp}-${file.name}`;

      console.log('📤 Uploading file to bucket:', this.BUCKET_NAME, 'Path:', fileName);

      // Verify session before upload
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('לא קיימת חיבור פעיל למערכת. יש להתחבר מחדש.');
      }

      console.log('🔐 Session verified, user authenticated');

      // Upload file to the bucket
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload failed:', error);
        throw new Error(`שגיאה בהעלאת הקובץ: ${error.message}`);
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
      // Check if bucket is accessible
      const hasAccess = await this.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה כרגע. אנא נסה שוב מאוחר יותר.');
      }

      // Get public URL (since our bucket is public)
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        console.log('✅ Public URL generated successfully');
        return data.publicUrl;
      }

      throw new Error('Failed to create file URL');
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }

  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      // Check if bucket is accessible
      const hasAccess = await this.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה כרגע. אנא נסה שוב מאוחר יותר.');
      }

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        console.error('❌ Download failed:', error);
        throw error;
      }

      console.log('✅ File downloaded successfully');
      return data;
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      throw error;
    }
  }
}
