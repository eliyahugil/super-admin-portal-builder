
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/components/auth/AuthContext';

export interface EmployeeFile {
  id: string;
  employee_id: string;
  business_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export const useEmployeeFilesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingEmployeeId, setUploadingEmployeeId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { businessId, isLoading } = useBusiness();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to check authentication
  const checkAuthSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session check error:', error);
        toast({
          title: 'שגיאת אותנטיקציה',
          description: 'נדרש להתחבר מחדש למערכת',
          variant: 'destructive'
        });
        return false;
      }

      if (!session?.access_token) {
        console.warn('⚠️ No valid session found');
        toast({
          title: 'נדרש להתחבר מחדש',
          description: 'הסשן פג תוקף - אנא התחבר מחדש כדי להמשיך',
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('💥 Authentication check failed:', error);
      toast({
        title: 'שגיאת מערכת',
        description: 'לא ניתן לאמת את הסשן - אנא רענן את הדף',
        variant: 'destructive'
      });
      return false;
    }
  };

  const { data: employees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, business_id')
        .order('first_name');

      if (businessId !== 'super_admin') {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !loading,
  });

  const { data: employeeFiles } = useQuery({
    queryKey: ['employee-files', selectedEmployee, businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employee_files')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id)
        `)
        .order('uploaded_at', { ascending: false });

      if (businessId !== 'super_admin') {
        query = query.eq('business_id', businessId);
      }

      if (selectedEmployee) {
        query = query.eq('employee_id', selectedEmployee);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !loading,
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, employeeId }: { file: File; employeeId: string }) => {
      console.log('📤 Starting file upload process...');
      
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      if (!businessId || !file || !user?.id) {
        console.error('❌ Missing required data:', { businessId, hasFile: !!file, userId: user?.id });
        throw new Error('Missing required data');
      }

      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${businessId}/${employeeId}/${fileName}`;

      console.log('📁 Uploading to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData.path);

      const { data: fileRecord, error: dbError } = await supabase
        .from('employee_files')
        .insert({
          employee_id: employeeId,
          business_id: businessId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
        })
        .select('*')
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        await supabase.storage.from('employee-files').remove([uploadData.path]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('✅ File record saved to database:', fileRecord);
      return fileRecord;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'הקובץ הועלה בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-files'] });
      setSelectedFile(null);
      setUploadDialogOpen(false);
      setUploadingEmployeeId('');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error 
          ? error.message === 'Authentication required' 
            ? 'נדרש להתחבר מחדש כדי להעלות קובץ'
            : `שגיאה בהעלאת הקובץ: ${error.message}`
          : 'שגיאה לא צפויה בהעלאת הקובץ',
        variant: 'destructive',
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (file: EmployeeFile) => {
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const { error: storageError } = await supabase.storage
        .from('employee-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('employee_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'הקובץ נמחק בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['employee-files'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error && error.message === 'Authentication required'
          ? 'נדרש להתחבר מחדש כדי למחוק קובץ'
          : 'שגיאה במחיקת הקובץ',
        variant: 'destructive',
      });
    },
  });

  const handleDownload = async (file: EmployeeFile) => {
    try {
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        return;
      }

      console.log('📥 Downloading file:', file.file_path);
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהורדת הקובץ',
        variant: 'destructive',
      });
    }
  };

  const filteredFiles = employeeFiles?.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.employee && 
     `${file.employee.first_name} ${file.employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    uploadDialogOpen,
    setUploadDialogOpen,
    selectedFile,
    setSelectedFile,
    uploadingEmployeeId,
    setUploadingEmployeeId,
    fileInputRef,
    
    // Data
    employees,
    filteredFiles,
    isLoading,
    
    // Mutations
    uploadFileMutation,
    deleteFileMutation,
    
    // Handlers
    handleDownload,
  };
};
