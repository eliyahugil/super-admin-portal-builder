import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ExternalLink, 
  Share2, 
  Save, 
  Eye,
  EyeOff,
  Calendar,
  User,
  FileText,
  Image,
  X,
  Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface FilePreviewModalProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (file && isOpen) {
      loadPreviewUrl();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, isOpen]);

  const loadPreviewUrl = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      console.log('Loading preview for file:', file.file_name, 'Type:', file.file_type);
      
      // Download file and create blob URL for direct viewing
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);

      if (error) throw error;

      // Create blob URL for all file types
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      
      console.log('Preview URL set successfully');
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: 'שגיאה בטעינת התצוגה',
        description: 'לא ניתן לטעון את התצוגה המקדימה - ייתכן שאין הרשאה לגשת לקובץ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
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
      
      toast({
        title: 'הקובץ הורד בהצלחה',
        description: `הקובץ "${file.file_name}" נשמר למחשב`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'שגיאה בהורדה',
        description: 'לא ניתן להוריד את הקובץ',
        variant: 'destructive',
      });
    }
  };

  const handleOpenInNewTab = async () => {
    if (!file) return;
    
    try {
      // Download file and open in new tab using blob URL
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);
      
      if (error) throw error;
      
      const blob = new Blob([data], { type: file.file_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      
      // Clean up URL after window is loaded
      if (newWindow) {
        newWindow.addEventListener('beforeunload', () => {
          URL.revokeObjectURL(url);
        });
      }
    } catch (error) {
      console.error('Error opening file:', error);
      toast({
        title: 'שגיאה בפתיחה',
        description: 'לא ניתן לפתוח את הקובץ בכרטיסייה חדשה',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!file || !previewUrl) return;
    
    try {
      if (navigator.share) {
        // For mobile devices that support native sharing
        await navigator.share({
          title: file.file_name,
          text: `קובץ: ${file.file_name}`,
          files: [new File([await fetch(previewUrl).then(r => r.blob())], file.file_name, { type: file.file_type || 'application/octet-stream' })]
        });
      } else {
        // Fallback - show message that sharing is not supported
        toast({
          title: 'שיתוף לא זמין',
          description: 'השתמש בכפתור "פתח בכרטיסייה חדשה" ושתף מהדפדפן',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'שגיאה בשיתוף',
        description: 'השתמש בכפתור "פתח בכרטיסייה חדשה" ושתף מהדפדפן',
      });
    }
  };

  const handleSave = async () => {
    if (!file) return;
    
    try {
      // Create signed URL for copying
      const { data, error } = await supabase.storage
        .from('employee-files')
        .createSignedUrl(file.file_path, 3600); // 1 hour expiry
      
      if (error) throw error;
      
      await navigator.clipboard.writeText(data.signedUrl);
      toast({
        title: 'הקישור הועתק',
        description: 'הקישור הזמני לקובץ הועתק ללוח (תוקף שעה)',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'שגיאה בשמירה',
        description: 'לא ניתן לשמור את הקישור',
        variant: 'destructive',
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

  const isImage = file?.file_type?.startsWith('image/');
  const isPdf = file?.file_type === 'application/pdf';
  const isText = file?.file_type?.startsWith('text/');

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {file.file_name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{formatFileSize(file.file_size)}</span>
                </div>
                <Badge variant={file.is_visible_to_employee ? "default" : "secondary"}>
                  {file.is_visible_to_employee ? (
                    <><Eye className="h-3 w-3 mr-1" />נראה לעובד</>
                  ) : (
                    <><EyeOff className="h-3 w-3 mr-1" />מוסתר מהעובד</>
                  )}
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(file.created_at).toLocaleDateString('he-IL')} 
                    {' '}
                    {new Date(file.created_at).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              הורדה
            </Button>
            <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              פתח בכרטיסייה חדשה
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              שיתוף
            </Button>
            <Button onClick={loadPreviewUrl} variant="outline" size="sm">
              <Maximize2 className="h-4 w-4 mr-2" />
              רענן תצוגה
            </Button>
          </div>

          {/* Preview Area */}
          <div className="h-[60vh] overflow-auto border rounded-lg bg-background">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="mr-4">טוען תצוגה מקדימה...</span>
              </div>
            ) : previewUrl ? (
              <div className="h-full">
                {isImage ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <img 
                      src={previewUrl} 
                      alt={file.file_name}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                ) : isPdf ? (
                  <div className="h-full">
                    <embed 
                      src={previewUrl}
                      type="application/pdf"
                      className="w-full h-full"
                      title={file.file_name}
                    />
                  </div>
                ) : isText ? (
                  <div className="h-full">
                    <iframe 
                      src={previewUrl}
                      className="w-full h-full border-0 bg-white"
                      title={file.file_name}
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="h-16 w-16 mb-4" />
                    <h3 className="text-lg font-medium mb-2">אין תצוגה מקדימה זמינה</h3>
                    <p className="text-sm text-center mb-4">
                      לא ניתן להציג תצוגה מקדימה עבור סוג קובץ זה ({file.file_type})
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        הורד את הקובץ
                      </Button>
                      <Button onClick={handleOpenInNewTab} variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        פתח בכרטיסייה חדשה
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">לא ניתן לטעון את התצוגה</h3>
                <p className="text-sm text-center mb-4">
                  ייתכן שהקובץ לא נמצא או שאין הרשאה לגשת אליו
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    הורדה
                  </Button>
                  <Button onClick={handleOpenInNewTab} variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    פתח בכרטיסייה חדשה
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};