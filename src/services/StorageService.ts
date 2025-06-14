
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  private static readonly BUCKET_NAME = 'employee-files';

  static async uploadEmployeeFile(file: File, userId: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const fileName = `employee-imports/${userId}/${timestamp}-${file.name}`;

      console.log('📤 Attempting to upload file to bucket:', this.BUCKET_NAME, 'Path:', fileName);

      // Verify session before upload
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('לא קיימת חיבור פעיל למערכת');
      }

      // Upload file to the bucket
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
      // Try to get public URL first (since our bucket is public)
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        return data.publicUrl;
      }

      // Fallback to signed URL if public URL doesn't work
      const { data: signedData, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error || !signedData?.signedUrl) {
        throw new Error('Failed to create file URL');
      }

      return signedData.signedUrl;
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }

  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        console.error('❌ Download failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      throw error;
    }
  }

  static async checkBucketAccess(): Promise<boolean> {
    try {
      // Check if we can access the bucket by listing files
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
