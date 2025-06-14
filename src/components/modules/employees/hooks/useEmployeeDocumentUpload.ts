
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { getFileType } from '../helpers/documentHelpers';

export const useEmployeeDocumentUpload = (employeeId: string | undefined, queryKeyForInvalidate: any[]) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!profile?.id && !user?.id) {
      toast({
        title: 'שגיאה',
        description: 'נדרש להתחבר למערכת כדי להעלות קבצים',
        variant: 'destructive',
      });
      return;
    }
    try {
      setUploading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error('No active session!');
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const fileEmployeeId = employeeId || 'templates';
      const filePath = `employee-documents/${fileEmployeeId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      const uploadedBy = profile?.id || user?.id;

      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId || null,
          assignee_id: null,
          document_name: file.name,
          document_type: getFileType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: uploadedBy,
        });

      if (insertError) {
        await supabase.storage.from('employee-files').remove([uploadData.path]);
        throw new Error(`Database error: ${insertError.message}`);
      }

      toast({
        title: 'הצלחה',
        description: 'המסמך הועלה בהצלחה',
      });

      queryClient.invalidateQueries({ queryKey: queryKeyForInvalidate });
    } catch (error: any) {
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
