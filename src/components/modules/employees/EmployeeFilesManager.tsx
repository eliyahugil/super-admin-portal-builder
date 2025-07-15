import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  FileIcon,
  Calendar,
  User
} from 'lucide-react';
import { useEmployeeFiles } from '@/hooks/useEmployeeFiles';
import { useAuth } from '@/components/auth/AuthContext';
import type { Employee } from '@/types/supabase';

interface EmployeeFilesManagerProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

export const EmployeeFilesManager: React.FC<EmployeeFilesManagerProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const { user } = useAuth();
  const {
    files,
    isLoading,
    uploadFile,
    deleteFile,
    updateFileVisibility,
    isUploading,
    isDeleting,
    isUpdating
  } = useEmployeeFiles(employeeId);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVisibleToEmployee, setIsVisibleToEmployee] = useState(true);

  // Check if user is business admin/manager
  const isBusinessAdmin = user?.role === 'super_admin' || user?.role === 'business_admin';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !employee.business_id) return;

    uploadFile({
      file: selectedFile,
      isVisibleToEmployee,
      businessId: employee.business_id
    });

    setSelectedFile(null);
    setIsUploadDialogOpen(false);
    setIsVisibleToEmployee(true);
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(file.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = (fileId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הקובץ?')) {
      deleteFile(fileId);
    }
  };

  const toggleFileVisibility = (fileId: string, currentVisibility: boolean) => {
    updateFileVisibility({
      fileId,
      isVisible: !currentVisibility
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'לא ידוע';
    const sizes = ['בתים', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Filter files based on user role and visibility
  const visibleFiles = isBusinessAdmin 
    ? files 
    : files.filter(file => file.is_visible_to_employee);

  const employeeVisibleFiles = files.filter(file => file.is_visible_to_employee);
  const adminOnlyFiles = files.filter(file => !file.is_visible_to_employee);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">טוען קבצים...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">קבצי העובד</h3>
        {isBusinessAdmin && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                העלה קובץ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">העלאת קובץ חדש</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">בחר קובץ</Label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full mt-2"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible-to-employee"
                    checked={isVisibleToEmployee}
                    onCheckedChange={(checked) => setIsVisibleToEmployee(!!checked)}
                  />
                  <Label htmlFor="visible-to-employee" className="text-right">
                    הקובץ יהיה גלוי לעובד
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'מעלה...' : 'העלה קובץ'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Admin view - show files by category */}
      {isBusinessAdmin ? (
        <div className="space-y-6">
          {/* Files visible to employee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Eye className="h-5 w-5" />
                קבצים גלויים לעובד ({employeeVisibleFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employeeVisibleFiles.length > 0 ? (
                <div className="space-y-3">
                  {employeeVisibleFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>
                            {file.uploader && (
                              <>
                                <span>•</span>
                                <User className="h-3 w-3" />
                                <span>{file.uploader.full_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          גלוי לעובד
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFileVisibility(file.id, file.is_visible_to_employee)}
                          disabled={isUpdating}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  אין קבצים גלויים לעובד
                </p>
              )}
            </CardContent>
          </Card>

          {/* Admin only files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <EyeOff className="h-5 w-5" />
                קבצים פרטיים למנהל ({adminOnlyFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adminOnlyFiles.length > 0 ? (
                <div className="space-y-3">
                  {adminOnlyFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>
                            {file.uploader && (
                              <>
                                <span>•</span>
                                <User className="h-3 w-3" />
                                <span>{file.uploader.full_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          פרטי למנהל
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFileVisibility(file.id, file.is_visible_to_employee)}
                          disabled={isUpdating}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  אין קבצים פרטיים למנהל
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Employee view - show only visible files */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              הקבצים שלי ({visibleFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visibleFiles.length > 0 ? (
              <div className="space-y-3">
                {visibleFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.file_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                אין קבצים זמינים
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};