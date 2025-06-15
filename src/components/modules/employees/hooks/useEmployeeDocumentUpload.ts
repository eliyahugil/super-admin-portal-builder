
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const useEmployeeDocumentUpload = (
  employeeId: string | undefined,
  queryKey: any[],
  onSuccess?: () => void
) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { businessId } = useCurrentBusiness();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isTemplate: boolean = false
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    // עבור תבניות, לא צריך employeeId
    if (!isTemplate && !employeeId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עובד',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const folderPath = isTemplate ? 'templates' : `employee-documents/${employeeId}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(filePath);

      // Create document record
      const documentData = {
        employee_id: isTemplate ? null : employeeId, // עבור תבניות, employee_id = null
        document_name: file.name,
        document_type: getDocumentType(file.name),
        file_url: publicUrl,
        status: isTemplate ? 'template' : 'pending',
        is_template: isTemplate,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert(documentData);

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('employee-documents')
          .remove([filePath]);
        throw dbError;
      }

      toast({
        title: 'הצלחה',
        description: isTemplate 
          ? 'התבנית הועלתה בהצלחה!'
          : 'המסמך הועלה בהצלחה!',
      });

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey });
      onSuccess?.();

    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בהעלאת המסמך',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return {
    uploading,
    handleFileUpload,
  };
};

// Helper function to determine document type
const getDocumentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['pdf'].includes(extension || '')) return 'contract';
  if (['doc', 'docx'].includes(extension || '')) return 'form';
  if (['jpg', 'jpeg', 'png'].includes(extension || '')) return 'id';
  
  return 'other';
};
