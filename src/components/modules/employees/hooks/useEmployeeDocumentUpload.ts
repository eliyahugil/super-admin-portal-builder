
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { getFileType } from '../helpers/documentHelpers';
import { StorageService } from '@/services/StorageService';

/**
 * This hook will now support template uploads.
 * - If employeeId is falsy (''), it uploads as a template (is_template: true, employee_id: null)
 */
export const useEmployeeDocumentUpload = (employeeId: string | undefined, queryKeyForInvalidate: any[]) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Allow uploading templates when employeeId is falsy (i.e., '').
    const uploadingTemplate = !employeeId;
    
    if (!profile?.id && !user?.id) {
      toast({
        title: 'שגיאה',
        description: 'נדרש להתחבר למערכת כדי להעלות קבצים',
        variant: 'destructive',
      });
      return;
    }
    
    // Validation: If not uploading templates and no employeeId, show error.
    if (!uploadingTemplate && !employeeId) {
      toast({
        title: 'לא נבחר עובד',
        description: 'עליך לבחור עובד מסוים כדי להעלות מסמך.',
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }
    
    try {
      setUploading(true);

      console.log('🔍 Starting upload process...');
      
      // Check bucket access first
      const hasAccess = await StorageService.checkBucketAccess();
      if (!hasAccess) {
        throw new Error('Storage system is not available. Please try again later or contact support.');
      }

      // Verify session before proceeding
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('לא קיימת חיבור פעיל למערכת');
      }

      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const fileEmployeeId = uploadingTemplate ? 'templates' : employeeId;
      const filePath = `employee-documents/${fileEmployeeId}/${fileName}`;

      console.log('📁 Uploading to path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`שגיאה בהעלאת הקובץ: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData.path);

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('לא ניתן ליצור קישור לקובץ');
      }

      const uploadedBy = profile?.id || user?.id;

      console.log('💾 Saving document record to database...');

      // Save document record to database
      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: uploadingTemplate ? null : employeeId,
          assignee_id: null,
          document_name: file.name,
          document_type: getFileType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: uploadedBy,
          is_template: uploadingTemplate,
          status: 'pending',
          reminder_count: 0
        });

      if (insertError) {
        console.error('❌ Database insert error:', insertError);
        // Try to clean up the uploaded file if database insert fails
        await supabase.storage.from('employee-files').remove([uploadData.path]);
        throw new Error(`שגיאה בשמירת המסמך: ${insertError.message}`);
      }

      console.log('✅ Document record saved successfully');

      toast({
        title: 'הצלחה',
        description: uploadingTemplate ? 'התבנית הועלתה בהצלחה!' : 'המסמך הועלה בהצלחה',
      });

      // Refresh the documents list
      queryClient.invalidateQueries({ queryKey: queryKeyForInvalidate });
      
    } catch (error: any) {
      console.error('💥 File upload error:', error);
      toast({
        title: 'שגיאה',
        description: error?.message ?? 'שגיאה בהעלאת מסמך',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return { uploading, handleFileUpload, setUploading };
};
