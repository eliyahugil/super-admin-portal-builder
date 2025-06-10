
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async createEmployeeFilesBucket() {
    try {
      const { data, error } = await supabase.storage.createBucket('employee-files', {
        public: false,
        allowedMimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error && !error.message.includes('already exists')) {
        throw error;
      }

      console.log('✅ Employee files bucket ready');
      return data;
    } catch (error) {
      console.error('❌ Error creating storage bucket:', error);
      throw error;
    }
  }

  static async uploadEmployeeFile(file: File, userId: string): Promise<string> {
    try {
      // Ensure bucket exists
      await this.createEmployeeFilesBucket();

      const timestamp = new Date().toISOString();
      const fileName = `employee-imports/${userId}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('employee-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

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
