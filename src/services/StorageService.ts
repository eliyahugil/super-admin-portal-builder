
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  private static readonly BUCKET_NAME = 'employee-files';

  static async checkBucketAccess(): Promise<boolean> {
    try {
      console.log('🔍 Checking bucket access for:', this.BUCKET_NAME);
      
      // First, try to list buckets to see what's available
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ Error listing buckets:', bucketsError);
        return false;
      }
      
      console.log('📦 Available buckets:', buckets?.map(b => b.name));
      
      // Check if our bucket exists
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      if (!bucketExists) {
        console.error('❌ Bucket not found in available buckets');
        return false;
      }

      // Try to access the bucket by listing files - this will test the policies
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
      // First check if bucket is accessible
      const hasAccess = await this.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה. אנא נסה שוב מאוחר יותר או פנה לתמיכה.');
      }

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
      // First check if bucket is accessible
      const hasAccess = await this.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה. אנא נסה שוב מאוחר יותר או פנה לתמיכה.');
      }

      // Try to get public URL first (since our bucket is public)
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        console.log('✅ Public URL generated successfully:', data.publicUrl);
        return data.publicUrl;
      }

      // Fallback to signed URL if public URL doesn't work
      const { data: signedData, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error || !signedData?.signedUrl) {
        throw new Error('Failed to create file URL');
      }

      console.log('✅ Signed URL generated successfully');
      return signedData.signedUrl;
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }

  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      // First check if bucket is accessible
      const hasAccess = await this.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('מערכת האחסון אינה זמינה. אנא נסה שוב מאוחר יותר או פנה לתמיכה.');
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
