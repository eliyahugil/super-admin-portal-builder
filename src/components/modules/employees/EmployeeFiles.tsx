import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Search, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/components/auth/AuthContext';

interface EmployeeFile {
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

export const EmployeeFiles: React.FC = () => {
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
    enabled: !!businessId && !isLoading,
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
    enabled: !!businessId && !isLoading,
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, employeeId }: { file: File; employeeId: string }) => {
      // Check authentication before upload
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      if (!businessId || !file || !user?.id) throw new Error('Missing required data');

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${businessId}/${employeeId}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file record to database
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

      if (dbError) throw dbError;

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
        description: error instanceof Error && error.message === 'Authentication required' 
          ? 'נדרש להתחבר מחדש כדי להעלות קובץ'
          : 'שגיאה בהעלאת הקובץ',
        variant: 'destructive',
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (file: EmployeeFile) => {
      // Check authentication before delete
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('employee-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && uploadingEmployeeId) {
      // Check authentication before starting upload
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        return;
      }
      
      uploadFileMutation.mutate({ file: selectedFile, employeeId: uploadingEmployeeId });
    }
  };

  const handleDownload = async (file: EmployeeFile) => {
    try {
      // Check authentication before download
      const isAuthenticated = await checkAuthSession();
      if (!isAuthenticated) {
        return;
      }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">קבצי עובדים</h1>
        <p className="text-gray-600">ניהול מסמכים וקבצים אישיים של העובדים</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש קבצים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל העובדים</option>
          {employees?.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name} ({employee.employee_id})
            </option>
          ))}
        </select>

        <Button 
          className="flex items-center gap-2"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          העלה קובץ
        </Button>
      </div>

      {/* Upload Dialog */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">העלאת קובץ</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFile(null);
                  setUploadingEmployeeId('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">בחר עובד</label>
                <select
                  value={uploadingEmployeeId}
                  onChange={(e) => setUploadingEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר עובד...</option>
                  {employees?.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">בחר קובץ</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedFile && (
                <div className="text-sm text-gray-600">
                  קובץ נבחר: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadingEmployeeId || uploadFileMutation.isPending}
                  className="flex-1"
                >
                  {uploadFileMutation.isPending ? 'מעלה...' : 'העלה'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setSelectedFile(null);
                    setUploadingEmployeeId('');
                  }}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles?.map((file) => (
          <Card key={file.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-blue-600" />
                <Badge variant="secondary">
                  {file.file_type || 'קובץ'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2 truncate">{file.file_name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {file.employee && `${file.employee.first_name} ${file.employee.last_name}`}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                גודל: {formatFileSize(file.file_size)}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                הועלה: {new Date(file.uploaded_at).toLocaleDateString('he-IL')}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4 ml-1" />
                  הורד
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteFileMutation.mutate(file)}
                  disabled={deleteFileMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין קבצים</h3>
          <p className="text-gray-600">לא נמצאו קבצים במערכת</p>
        </div>
      )}
    </div>
  );
};
