
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeDocuments = (employeeId: string) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `employee-documents/${employeeId}/${timestamp}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      // Save document record
      const { data: user } = await supabase.auth.getUser();
      
      const { data: documentData, error: insertError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          document_name: file.name,
          document_type: getDocumentType(file.name),
          file_url: urlData.publicUrl,
          uploaded_by: user.user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      return documentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'המסמך הועלה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעלות את המסמך',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast({
        title: 'הצלחה',
        description: 'המסמך נמחק בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את המסמך',
        variant: 'destructive',
      });
    },
  });

  const getDocumentType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'contract';
      case 'doc':
      case 'docx': return 'form';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'id';
      default: return 'other';
    }
  };

  return {
    documents: documents || [],
    isLoading,
    uploading,
    uploadDocument: uploadDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
  };
};
