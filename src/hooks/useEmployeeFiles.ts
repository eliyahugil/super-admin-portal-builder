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

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ 
      file, 
      isVisibleToEmployee, 
      businessId 
    }: { 
      file: File; 
      isVisibleToEmployee: boolean; 
      businessId: string; 
    }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to upload files');
      }

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
          is_visible_to_employee: isVisibleToEmployee
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

  return {
    files: files || [],
    isLoading,
    uploadFile: uploadFileMutation.mutate,
    deleteFile: deleteFileMutation.mutate,
    updateFileVisibility: updateFileVisibilityMutation.mutate,
    isUploading: uploadFileMutation.isPending,
    isDeleting: deleteFileMutation.isPending,
    isUpdating: updateFileVisibilityMutation.isPending,
  };
};