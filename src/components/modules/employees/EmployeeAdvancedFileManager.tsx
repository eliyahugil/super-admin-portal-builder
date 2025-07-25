import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileApprovalCard } from './files/FileApprovalCard';
import { FileDataExtractor } from './files/FileDataExtractor';
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
  FolderIcon,
  Edit3,
  GripVertical,
  Search,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { FilePreviewModal } from './files/FilePreviewModal';
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
  uploaded_at: string | null;
  uploaded_by: string;
}

interface EmployeeAdvancedFileManagerProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
  showApprovalSystem?: boolean;
}

export const EmployeeAdvancedFileManager: React.FC<EmployeeAdvancedFileManagerProps> = ({
  employee,
  employeeId,
  employeeName,
  showApprovalSystem = false
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
  const [customFileName, setCustomFileName] = useState('');
  const [isFileVisible, setIsFileVisible] = useState(true);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileData | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [draggedFile, setDraggedFile] = useState<FileData | null>(null);
  const [draggedFolder, setDraggedFolder] = useState<Folder | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // שליפת תיקיות
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['employee-folders', employeeId, currentFolder],
    queryFn: async (): Promise<Folder[]> => {
      let query = supabase
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
        .eq('is_active', true);

      // סינון לפי תיקיית אב - אם זה null אז משתמשים ב-is(null), אחרת ב-eq
      if (currentFolder === null) {
        query = query.is('parent_folder_id', null);
      } else {
        query = query.eq('parent_folder_id', currentFolder);
      }

      query = query.order('folder_name');

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });

  // שליפת קבצים בתיקייה הנוכחית
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['employee-files', employeeId, currentFolder],
    queryFn: async (): Promise<FileData[]> => {
      let query = supabase
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
          uploaded_at,
          uploaded_by
        `)
        .eq('employee_id', employeeId);

      // סינון לפי תיקייה - אם זה null אז משתמשים ב-is(null), אחרת ב-eq
      if (currentFolder === null) {
        query = query.is('folder_id', null);
      } else {
        query = query.eq('folder_id', currentFolder);
      }

      query = query.order('file_name');

      const { data, error } = await query;

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
    mutationFn: async ({ file, visible, customName }: { file: globalThis.File; visible: boolean; customName?: string }) => {
      // העלאה לאחסון - ניקוי שם הקובץ
      const displayName = customName || file.name;
      const cleanFileName = file.name
        .replace(/[^\x00-\x7F]/g, '') // הסרת תווים לא-ASCII (כולל עברית)
        .replace(/[^a-zA-Z0-9._-]/g, '_') // החלפת תווים מיוחדים ב-_
        .replace(/_{2,}/g, '_') // החלפת מספר _ ברצף ב-_ אחד
        .replace(/^_|_$/g, ''); // הסרת _ מתחילת וסוף השם
      const fileName = `${Date.now()}-${cleanFileName}`;
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
          file_name: displayName,
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
      setCustomFileName('');
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

  // שינוי שם קובץ
  const renameFileMutation = useMutation({
    mutationFn: async ({ fileId, newName }: { fileId: string; newName: string }) => {
      const { data, error } = await supabase
        .from('employee_files')
        .update({ file_name: newName })
        .eq('id', fileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-files'] });
      setIsRenameDialogOpen(false);
      setFileToRename(null);
      setNewFileName('');
      toast({
        title: 'שם הקובץ שונה בהצלחה',
        description: 'השם החדש נשמר',
      });
    },
    onError: (error) => {
      console.error('Error renaming file:', error);
      toast({
        title: 'שגיאה בשינוי שם קובץ',
        description: 'לא ניתן לשנות את שם הקובץ',
        variant: 'destructive',
      });
    },
  });

  // העברת קובץ לתיקייה אחרת
  const moveFileMutation = useMutation({
    mutationFn: async ({ fileId, newFolderId }: { fileId: string; newFolderId: string | null }) => {
      const { data, error } = await supabase
        .from('employee_files')
        .update({ folder_id: newFolderId })
        .eq('id', fileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-files'] });
      toast({
        title: 'קובץ הועבר בהצלחה',
        description: 'הקובץ הועבר לתיקייה החדשה',
      });
    },
    onError: (error) => {
      console.error('Error moving file:', error);
      toast({
        title: 'שגיאה בהעברת קובץ',
        description: 'לא ניתן להעביר את הקובץ',
        variant: 'destructive',
      });
    },
  });

  // העברת תיקייה לתיקייה אחרת
  const moveFolderMutation = useMutation({
    mutationFn: async ({ folderId, newParentId }: { folderId: string; newParentId: string | null }) => {
      const { data, error } = await supabase
        .from('employee_folders')
        .update({ parent_folder_id: newParentId })
        .eq('id', folderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-folders'] });
      toast({
        title: 'תיקייה הועברה בהצלחה',
        description: 'התיקייה הועברה למיקום החדש',
      });
    },
    onError: (error) => {
      console.error('Error moving folder:', error);
      toast({
        title: 'שגיאה בהעברת תיקייה',
        description: 'לא ניתן להעביר את התיקייה',
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
      setCustomFileName(file.name); // הגדרת שם ברירת מחדל
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
        customName: customFileName.trim() || undefined,
      });
    }
  };

  const handleRenameFile = () => {
    if (fileToRename && newFileName.trim()) {
      renameFileMutation.mutate({
        fileId: fileToRename.id,
        newName: newFileName.trim(),
      });
    }
  };

  const openRenameDialog = (file: FileData) => {
    setFileToRename(file);
    setNewFileName(file.file_name);
    setIsRenameDialogOpen(true);
  };

  // פונקציות drag & drop
  const handleDragStart = (e: React.DragEvent, file: FileData) => {
    setDraggedFile(file);
    setDraggedFolder(null);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFolderDragStart = (e: React.DragEvent, folder: Folder) => {
    setDraggedFolder(folder);
    setDraggedFile(null);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDraggedFolder(null);
    setDropTarget(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(folderId);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    
    // העברת קובץ
    if (draggedFile && draggedFile.folder_id !== targetFolderId) {
      moveFileMutation.mutate({
        fileId: draggedFile.id,
        newFolderId: targetFolderId,
      });
    }
    
    // העברת תיקייה
    if (draggedFolder && draggedFolder.parent_folder_id !== targetFolderId && draggedFolder.id !== targetFolderId) {
      moveFolderMutation.mutate({
        folderId: draggedFolder.id,
        newParentId: targetFolderId,
      });
    }
    
    setDropTarget(null);
    setDraggedFile(null);
    setDraggedFolder(null);
    setIsDragging(false);
  };

  const openPreview = (file: FileData) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setIsPreviewOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLoading = foldersLoading || filesLoading;

  // שליפת קבצים עם סטטוס אישור אם מערכת האישורים מופעלת
  const { data: filesWithApproval, isLoading: approvalFilesLoading } = useQuery({
    queryKey: ['employee-files-with-approval', employeeId, currentFolder],
    queryFn: async (): Promise<(FileData & { approval_status?: string; extracted_data?: any })[]> => {
      if (!showApprovalSystem) return [];
      
      let query = supabase
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
          uploaded_at,
          uploaded_by,
          approval_status,
          extracted_data
        `)
        .eq('employee_id', employeeId);

      if (currentFolder === null) {
        query = query.is('folder_id', null);
      } else {
        query = query.eq('folder_id', currentFolder);
      }

      query = query.order('file_name');

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: showApprovalSystem,
  });

  if (showApprovalSystem) {
    return (
      <div className="space-y-6" dir="rtl">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              ניהול קבצים רגיל
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              קבצים לאישור
              {filesWithApproval?.filter(f => f.approval_status === 'pending').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filesWithApproval.filter(f => f.approval_status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              קבצים מאושרים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  ניהול קבצים רגיל
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* כאן יהיה התוכן הרגיל של ניהול הקבצים */}
                <p className="text-muted-foreground">
                  מערכת ניהול קבצים רגילה ללא מערכת אישורים
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {approvalFilesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="mr-2">טוען קבצים...</span>
                </div>
              ) : (
                <>
                  {filesWithApproval?.filter(f => f.approval_status === 'pending').map((file) => (
                    <FileApprovalCard
                      key={file.id}
                      file={{
                        ...file,
                        approval_status: file.approval_status as 'pending' | 'approved' | 'rejected',
                        employee: {
                          id: employeeId,
                          first_name: employee.first_name || '',
                          last_name: employee.last_name || ''
                        }
                      }}
                    />
                  ))}
                  {filesWithApproval?.filter(f => f.approval_status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">אין קבצים ממתינים לאישור</h3>
                      <p>כל הקבצים כבר אושרו או נדחו</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="space-y-4">
              {filesWithApproval?.filter(f => f.approval_status === 'approved').map((file) => (
                <div key={file.id} className="space-y-4">
                  <FileApprovalCard
                    file={{
                      ...file,
                      approval_status: file.approval_status as 'pending' | 'approved' | 'rejected',
                      employee: {
                        id: employeeId,
                        first_name: employee.first_name || '',
                        last_name: employee.last_name || ''
                      }
                    }}
                  />
                  {file.extracted_data && Object.keys(file.extracted_data).length > 0 && (
                    <FileDataExtractor
                      file={{
                        id: file.id,
                        file_name: file.file_name,
                        extracted_data: file.extracted_data,
                        is_auto_extracted: true,
                        created_at: file.created_at
                      }}
                      onApplyToProfile={(data) => {
                        console.log('Applying data to profile:', data);
                        // כאן נוסיף לוגיקה להעברת הנתונים לפרופיל העובד
                      }}
                    />
                  )}
                </div>
              ))}
              {filesWithApproval?.filter(f => f.approval_status === 'approved').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">אין קבצים מאושרים</h3>
                  <p>לא נמצאו קבצים שאושרו</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

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
              accept="*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardTitle>

        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* כפתור חזרה */}
            {breadcrumbs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={navigateBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                חזור
              </Button>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToRoot}
                className="p-2 h-auto hover:bg-muted"
              >
                <FolderIcon className="h-4 w-4 mr-1" />
                תיקיית הבסיס
              </Button>
              {breadcrumbs.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <span className="text-muted-foreground">/</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto hover:bg-muted font-medium"
                    onClick={() => {
                      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
                      setBreadcrumbs(newBreadcrumbs);
                      setCurrentFolder(folder.id);
                    }}
                  >
                    {folder.folder_name}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* מיקום נוכחי */}
          <div className="text-sm text-muted-foreground">
            {breadcrumbs.length === 0 ? 'תיקיית הבסיס' : breadcrumbs[breadcrumbs.length - 1].folder_name}
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 group relative min-h-[120px] ${
                        dropTarget === folder.id 
                          ? 'border-primary bg-primary/10 scale-105' 
                          : 'hover:bg-muted/50 hover:border-primary/50'
                      } ${isDragging ? 'border-dashed' : ''} ${
                        draggedFolder?.id === folder.id ? 'opacity-50 scale-95' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleFolderDragStart(e, folder)}
                      onDragEnd={handleDragEnd}
                      onDoubleClick={() => navigateToFolder(folder)}
                      onDragOver={(e) => handleDragOver(e, folder.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, folder.id)}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header with icon and menu */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="relative">
                            <FolderIcon 
                              className={`h-12 w-12 transition-transform duration-200 ${
                                dropTarget === folder.id ? 'scale-110' : ''
                              }`}
                              style={{ color: folder.folder_color }}
                            />
                            {/* Drag indicator */}
                            {isDragging && draggedFolder?.id === folder.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <GripVertical className="h-6 w-6 text-primary animate-pulse" />
                              </div>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => navigateToFolder(folder)}>
                                <FolderOpen className="h-4 w-4 mr-2" />
                                פתח תיקייה
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteFolderMutation.mutate(folder.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                מחק תיקייה
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Folder name - full display */}
                        <div className="flex-1 mb-2">
                          <p className="text-sm font-medium leading-tight break-words" title={folder.folder_name}>
                            {folder.folder_name}
                          </p>
                        </div>
                        
                        {/* Date and metadata */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>נוצרה: {new Date(folder.created_at).toLocaleDateString('he-IL', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>תיקייה</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Drop zone indicator */}
                      {dropTarget === folder.id && (
                        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">שחרר כאן</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Drop zone for root folder */}
                  {isDragging && currentFolder !== null && (
                    <div
                      className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 min-h-[120px] flex items-center justify-center ${
                        dropTarget === null 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted-foreground/30'
                      }`}
                      onDragOver={(e) => handleDragOver(e, null)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, null)}
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FolderIcon className="h-12 w-12 mb-2" />
                        <span className="text-sm font-medium">תיקיית הבסיס</span>
                        <span className="text-xs">שחרר כאן להעברה לבסיס</span>
                      </div>
                    </div>
                  )}
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
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                        draggedFile?.id === file.id 
                          ? 'opacity-50 scale-95' 
                          : 'hover:bg-muted/50'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          {isDragging && draggedFile?.id === file.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <GripVertical className="h-4 w-4 text-primary animate-pulse" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {formatFileSize(file.file_size)}
                            </span>
                            <Badge variant={file.is_visible_to_employee ? "default" : "secondary"} className="text-xs">
                              {file.is_visible_to_employee ? 
                                <><Eye className="h-3 w-3 mr-1" />נראה לעובד</> : 
                                <><EyeOff className="h-3 w-3 mr-1" />לא נראה לעובד</>
                              }
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(file.created_at).toLocaleDateString('he-IL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })} {new Date(file.created_at).toLocaleTimeString('he-IL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openPreview(file)}>
                              <Search className="h-4 w-4 mr-2" />
                              תצוגה מקדימה
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRenameDialog(file)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              שנה שם
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              הורד קובץ
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              מחק קובץ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            
            {/* הוראות drag & drop */}
            {(files && files.length > 0) || (folders && folders.length > 0) && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>טיפים:</strong> 
                  {files && files.length > 0 && <span> ניתן לגרור קבצים ולשחרר אותם על תיקיות כדי להעביר אותם.</span>}
                  {folders && folders.length > 0 && <span> ניתן לגרור תיקיות אחת לתוך השנייה.</span>}
                  <span> לחץ פעמיים על קובץ או תיקייה לפתיחה מהירה.</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* דיאלוג העלאת קובץ */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>העלאת קובץ חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="customFileName">שם הקובץ</Label>
                <Input
                  id="customFileName"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="הכנס שם לקובץ"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ניתן לשנות את שם הקובץ לפני ההעלאה
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={isFileVisible}
                  onChange={(e) => setIsFileVisible(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="visible">נראה לעובד</Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleUploadFile}
                  disabled={!selectedFile || !customFileName.trim() || uploadFileMutation.isPending}
                  className="flex-1"
                >
                  {uploadFileMutation.isPending ? 'מעלה...' : 'העלה קובץ'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                    setCustomFileName('');
                  }}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* דיאלוג שינוי שם קובץ */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>שינוי שם קובץ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFileName">שם חדש לקובץ</Label>
                <Input
                  id="newFileName"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="הכנס שם חדש לקובץ"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleRenameFile}
                  disabled={!newFileName.trim() || renameFileMutation.isPending}
                  className="flex-1"
                >
                  {renameFileMutation.isPending ? 'משנה...' : 'שנה שם'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRenameDialogOpen(false);
                    setFileToRename(null);
                    setNewFileName('');
                  }}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* File Preview Modal */}
        <FilePreviewModal
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      </CardContent>
    </Card>
  );
};