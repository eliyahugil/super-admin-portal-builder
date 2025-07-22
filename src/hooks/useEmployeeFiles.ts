import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

export interface EmployeeFile {
  id: string;
  employee_id: string;
  business_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  document_type?: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  is_visible_to_employee: boolean;
  uploader?: {
    full_name: string;
    email: string;
  };
}

export const useEmployeeFiles = (employeeId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch employee files
  const { data: files, isLoading } = useQuery({
    queryKey: ['employee-files', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_files')
        .select(`
          *,
          uploader:profiles!employee_files_uploaded_by_fkey(full_name, email)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employee files:', error);
        throw error;
      }

      return data as EmployeeFile[];
    },
    enabled: !!employeeId,
  });

  // Upload file mutation (supports all file types including Form 101)
  const uploadFileMutation = useMutation({
    mutationFn: async ({ 
      file, 
      isVisibleToEmployee, 
      businessId,
      isForm101 = false
    }: { 
      file: File; 
      isVisibleToEmployee: boolean; 
      businessId: string; 
      isForm101?: boolean;
    }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to upload files');
      }

      // Determine document type
      const getDocumentType = (fileName: string, isForm101: boolean): string => {
        if (isForm101) return 'form_101';
        
        const extension = fileName.split('.').pop()?.toLowerCase();
        const lowerFileName = fileName.toLowerCase();
        
        // Auto-detect Form 101
        if (lowerFileName.includes('טופס 101') || lowerFileName.includes('form 101') || lowerFileName.includes('101')) {
          return 'form_101';
        }
        
        if (['pdf'].includes(extension || '')) return 'contract';
        if (['doc', 'docx'].includes(extension || '')) return 'form';
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'id';
        if (['txt', 'rtf'].includes(extension || '')) return 'document';
        if (['xlsx', 'xls', 'csv'].includes(extension || '')) return 'spreadsheet';
        
        return 'other';
      };

      // Upload to storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `employee-files/${employeeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath);

      const documentType = getDocumentType(file.name, isForm101);

      // Create database record
      const { data, error } = await supabase
        .from('employee_files')
        .insert({
          employee_id: employeeId,
          business_id: businessId,
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
          is_visible_to_employee: isVisibleToEmployee,
          document_type: documentType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-files', employeeId] });
      toast({
        title: 'קובץ הועלה',
        description: 'הקובץ הועלה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעלות את הקובץ',
        variant: 'destructive',
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('employee_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-files', employeeId] });
      toast({
        title: 'קובץ נמחק',
        description: 'הקובץ נמחק בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error deleting file:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את הקובץ',
        variant: 'destructive',
      });
    },
  });

  // Update file visibility mutation
  const updateFileVisibilityMutation = useMutation({
    mutationFn: async ({ fileId, isVisible }: { fileId: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('employee_files')
        .update({ is_visible_to_employee: isVisible })
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-files', employeeId] });
      toast({
        title: 'עודכן',
        description: 'הגדרות הנראות עודכנו בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating file visibility:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את הגדרות הנראות',
        variant: 'destructive',
      });
    },
  });

  // Add Form 101 upload helper
  const uploadForm101 = (file: File, businessId: string, isVisibleToEmployee: boolean = true) => {
    uploadFileMutation.mutate({ file, isVisibleToEmployee, businessId, isForm101: true });
  };

  return {
    files: files || [],
    isLoading,
    uploadFile: uploadFileMutation.mutate,
    uploadForm101,
    deleteFile: deleteFileMutation.mutate,
    updateFileVisibility: updateFileVisibilityMutation.mutate,
    isUploading: uploadFileMutation.isPending,
    isDeleting: deleteFileMutation.isPending,
    isUpdating: updateFileVisibilityMutation.isPending,
  };
};