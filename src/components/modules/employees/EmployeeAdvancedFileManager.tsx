import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FolderOpen, 
  FolderPlus, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  MoreVertical,
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  User,
  FolderIcon
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types/supabase';

interface Folder {
  id: string;
  folder_name: string;
  folder_path: string;
  folder_color: string;
  parent_folder_id: string | null;
  created_at: string;
  files_count?: number;
}

interface FileData {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  folder_id: string | null;
  is_visible_to_employee: boolean;
  created_at: string;
  uploaded_by: string;
}

interface EmployeeAdvancedFileManagerProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

export const EmployeeAdvancedFileManager: React.FC<EmployeeAdvancedFileManagerProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [isFileVisible, setIsFileVisible] = useState(true);

  // שליפת תיקיות
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['employee-folders', employeeId, currentFolder],
    queryFn: async (): Promise<Folder[]> => {
      const { data, error } = await supabase
        .from('employee_folders')
        .select(`
          id,
          folder_name,
          folder_path,
          folder_color,
          parent_folder_id,
          created_at
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .eq('parent_folder_id', currentFolder)
        .order('folder_name');

      if (error) throw error;
      return data || [];
    },
  });

  // שליפת קבצים בתיקייה הנוכחית
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['employee-files', employeeId, currentFolder],
    queryFn: async (): Promise<FileData[]> => {
      const { data, error } = await supabase
        .from('employee_files')
        .select(`
          id,
          file_name,
          file_path,
          file_size,
          file_type,
          folder_id,
          is_visible_to_employee,
          created_at,
          uploaded_by
        `)
        .eq('employee_id', employeeId)
        .eq('folder_id', currentFolder)
        .order('file_name');

      if (error) throw error;
      return data || [];
    },
  });

  // יצירת תיקייה חדשה
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const folderPath = currentFolder 
        ? `${breadcrumbs[breadcrumbs.length - 1]?.folder_path}/${name}`
        : `/${name}`;

      const { data, error } = await supabase
        .from('employee_folders')
        .insert({
          employee_id: employeeId,
          business_id: employee.business_id,
          folder_name: name,
          folder_path: folderPath,
          folder_color: color,
          parent_folder_id: currentFolder,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-folders'] });
      setIsCreateFolderOpen(false);
      setNewFolderName('');
      toast({
        title: 'תיקייה נוצרה בהצלחה',
        description: `התיקייה "${newFolderName}" נוצרה במיקום הנוכחי`,
      });
    },
    onError: (error) => {
      console.error('Error creating folder:', error);
      toast({
        title: 'שגיאה ביצירת תיקייה',
        description: 'לא ניתן ליצור את התיקייה',
        variant: 'destructive',
      });
    },
  });

  // העלאת קובץ
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, visible }: { file: globalThis.File; visible: boolean }) => {
      // העלאה לאחסון
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `employee-files/${employeeId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // שמירת מטא-דאטה בטבלה
      const { data, error } = await supabase
        .from('employee_files')
        .insert({
          employee_id: employeeId,
          business_id: employee.business_id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          folder_id: currentFolder,
          is_visible_to_employee: visible,
          uploaded_by: profile?.id || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-files'] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      toast({
        title: 'קובץ הועלה בהצלחה',
        description: 'הקובץ נשמר בתיקייה הנוכחית',
      });
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      toast({
        title: 'שגיאה בהעלאת קובץ',
        description: 'לא ניתן להעלות את הקובץ',
        variant: 'destructive',
      });
    },
  });

  // מחיקת תיקייה
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('employee_folders')
        .update({ is_active: false })
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-folders'] });
      toast({
        title: 'תיקייה נמחקה',
        description: 'התיקייה הועברה לארכיון',
      });
    },
  });

  // ניווט לתיקייה
  const navigateToFolder = async (folder: Folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  // חזרה לתיקייה הקודמת
  const navigateBack = () => {
    if (breadcrumbs.length === 0) return;
    
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs.length > 0 ? newBreadcrumbs[newBreadcrumbs.length - 1].id : null);
  };

  // חזרה לרוט
  const navigateToRoot = () => {
    setCurrentFolder(null);
    setBreadcrumbs([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate({
        name: newFolderName.trim(),
        color: newFolderColor,
      });
    }
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      uploadFileMutation.mutate({
        file: selectedFile,
        visible: isFileVisible,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLoading = foldersLoading || filesLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            מערכת קבצים מתקדמת - {employeeName}
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  תיקייה חדשה
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>יצירת תיקייה חדשה</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folderName">שם התיקייה</Label>
                    <Input
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="הכנס שם תיקייה..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="folderColor">צבע התיקייה</Label>
                    <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#3b82f6">כחול</SelectItem>
                        <SelectItem value="#10b981">ירוק</SelectItem>
                        <SelectItem value="#f59e0b">כתום</SelectItem>
                        <SelectItem value="#ef4444">אדום</SelectItem>
                        <SelectItem value="#8b5cf6">סגול</SelectItem>
                        <SelectItem value="#6b7280">אפור</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateFolder} 
                    disabled={!newFolderName.trim() || createFolderMutation.isPending}
                    className="w-full"
                  >
                    {createFolderMutation.isPending ? 'יוצר...' : 'צור תיקייה'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" asChild>
              <label htmlFor="fileUpload" className="cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                העלה קובץ
              </label>
            </Button>
            <input
              id="fileUpload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardTitle>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToRoot}
            className="p-1 h-auto"
          >
            <FolderIcon className="h-4 w-4" />
          </Button>
          {breadcrumbs.length > 0 && <span>/</span>}
          {breadcrumbs.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <span className="cursor-pointer hover:text-foreground" onClick={() => {
                const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
                setBreadcrumbs(newBreadcrumbs);
                setCurrentFolder(folder.id);
              }}>
                {folder.folder_name}
              </span>
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mr-2">טוען תיקיות וקבצים...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* תיקיות */}
            {folders && folders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FolderIcon className="h-4 w-4" />
                  תיקיות
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                      onDoubleClick={() => navigateToFolder(folder)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FolderIcon 
                          className="h-8 w-8" 
                          style={{ color: folder.folder_color }}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => navigateToFolder(folder)}>
                              פתח תיקייה
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteFolderMutation.mutate(folder.id)}
                              className="text-destructive"
                            >
                              מחק תיקייה
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm font-medium truncate">{folder.folder_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(folder.created_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* קבצים */}
            {files && files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  קבצים
                </h4>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <Badge variant={file.is_visible_to_employee ? "default" : "secondary"}>
                              {file.is_visible_to_employee ? 
                                <><Eye className="h-3 w-3 mr-1" />נראה לעובד</> : 
                                <><EyeOff className="h-3 w-3 mr-1" />לא נראה לעובד</>
                              }
                            </Badge>
                            <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* הודעה כשאין תוכן */}
            {(!folders || folders.length === 0) && (!files || files.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">התיקייה ריקה</h3>
                <p>לא נמצאו קבצים או תיקיות במיקום זה</p>
                <p className="text-sm mt-2">השתמש בכפתורים למעלה כדי ליצור תיקיות או להעלות קבצים</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>העלאת קובץ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFile && (
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fileVisible"
                  checked={isFileVisible}
                  onChange={(e) => setIsFileVisible(e.target.checked)}
                />
                <Label htmlFor="fileVisible">נראה לעובד</Label>
              </div>
              <Button 
                onClick={handleUploadFile} 
                disabled={!selectedFile || uploadFileMutation.isPending}
                className="w-full"
              >
                {uploadFileMutation.isPending ? 'מעלה...' : 'העלה קובץ'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};