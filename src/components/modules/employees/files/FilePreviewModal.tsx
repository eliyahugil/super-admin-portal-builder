import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ExternalLink, 
  Share2, 
  Eye,
  EyeOff,
  Calendar,
  FileText,
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
      console.log('🔍 Loading preview for file:', {
        name: file.file_name,
        type: file.file_type,
        path: file.file_path,
        isImage,
        isPdf,
        isText
      });
      
      // Always download file and create blob URL for security
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);

      if (error) {
        console.error('❌ Download error:', error);
        throw error;
      }

      console.log('✅ File downloaded successfully, size:', data.size);

      // Create blob URL for all file types
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      
      console.log('✅ Preview URL created:', url);
      console.log('✅ File type detected:', {
        isImage,
        isPdf,
        isText,
        fileType: file.file_type
      });
    } catch (error: any) {
      console.error('❌ Error loading preview:', error);
      toast({
        title: 'שגיאה בטעינת התצוגה',
        description: `לא ניתן לטעון את התצוגה המקדימה: ${error.message}`,
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
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-hidden p-0">
        <DialogHeader className="border-b pb-4 px-4 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base md:text-lg font-semibold truncate">
                {file.file_name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{formatFileSize(file.file_size)}</span>
                </div>
                <Badge variant={file.is_visible_to_employee ? "default" : "secondary"} className="text-xs">
                  {file.is_visible_to_employee ? (
                    <><Eye className="h-2 w-2 md:h-3 md:w-3 mr-1" />נראה לעובד</>
                  ) : (
                    <><EyeOff className="h-2 w-2 md:h-3 md:w-3 mr-1" />מוסתר מהעובד</>
                  )}
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-2 w-2 md:h-3 md:w-3" />
                  <span className="hidden md:inline">
                    {new Date(file.created_at).toLocaleDateString('he-IL')} 
                    {' '}
                    {new Date(file.created_at).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="md:hidden">
                    {new Date(file.created_at).toLocaleDateString('he-IL')}
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

        <div className="flex-1 overflow-hidden p-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mb-4 p-3 md:p-4 bg-muted/50 rounded-lg">
            <Button onClick={handleDownload} variant="outline" size="sm" className="text-xs md:text-sm">
              <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">הורדה</span>
              <span className="md:hidden">הורד</span>
            </Button>
            <Button onClick={handleOpenInNewTab} variant="outline" size="sm" className="text-xs md:text-sm">
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">פתח בכרטיסייה חדשה</span>
              <span className="md:hidden">פתח</span>
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm" className="text-xs md:text-sm">
              <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              שיתוף
            </Button>
            <Button onClick={loadPreviewUrl} variant="outline" size="sm" className="text-xs md:text-sm">
              <Maximize2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">רענן תצוגה</span>
              <span className="md:hidden">רענן</span>
            </Button>
          </div>

          {/* Preview Area */}
          <div className="h-[50vh] md:h-[60vh] overflow-auto border rounded-lg bg-background">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary"></div>
                <span className="mr-4 text-sm md:text-base">טוען תצוגה מקדימה...</span>
              </div>
            ) : previewUrl ? (
              <div className="h-full">
                {isImage ? (
                  <div className="flex items-center justify-center h-full p-2 md:p-4">
                    <img 
                      src={previewUrl} 
                      alt={file.file_name}
                      className="max-w-full max-h-full object-contain rounded"
                      onError={(e) => {
                        console.error('❌ Image failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('✅ Image loaded successfully')}
                    />
                  </div>
                ) : isPdf ? (
                  <div className="h-full">
                    {(() => {
                      console.log('📄 Rendering PDF preview with URL:', previewUrl);
                      return null;
                    })()}
                    {/* Use object tag for better PDF compatibility */}
                    <div className="h-full relative">
                      <object 
                        data={previewUrl}
                        type="application/pdf"
                        className="w-full h-full"
                        title={file.file_name}
                      >
                        {/* Fallback for browsers that don't support PDF viewing */}
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
                          <h3 className="text-base font-medium mb-2">לא ניתן לצפות ב-PDF בדפדפן זה</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            נסה להוריד את הקובץ או לפתוח אותו בדפדפן אחר
                          </p>
                          <div className="flex gap-2">
                            <Button onClick={handleDownload} variant="default" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              הורד PDF
                            </Button>
                            <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              פתח בטאב חדש
                            </Button>
                          </div>
                        </div>
                      </object>
                    </div>
                  </div>
                ) : isText ? (
                  <div className="h-full p-2 md:p-4">
                    <iframe 
                      src={previewUrl}
                      className="w-full h-full border-0 bg-white rounded"
                      title={file.file_name}
                      sandbox="allow-same-origin"
                      onLoad={() => console.log('✅ Text iframe loaded')}
                      onError={() => console.error('❌ Text iframe failed')}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                    <FileText className="h-12 w-12 md:h-16 md:w-16 mb-4" />
                    <h3 className="text-base md:text-lg font-medium mb-2 text-center">אין תצוגה מקדימה זמינה</h3>
                    <p className="text-sm text-center mb-4">
                      לא ניתן להציג תצוגה מקדימה עבור סוג קובץ זה ({file.file_type})
                    </p>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <Button onClick={handleDownload} variant="default" size="sm" className="w-full md:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        הורד את הקובץ
                      </Button>
                      <Button onClick={handleOpenInNewTab} variant="outline" size="sm" className="w-full md:w-auto">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        פתח בכרטיסייה חדשה
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <FileText className="h-12 w-12 md:h-16 md:w-16 mb-4" />
                <h3 className="text-base md:text-lg font-medium mb-2 text-center">לא ניתן לטעון את התצוגה</h3>
                <p className="text-sm text-center mb-4">
                  ייתכן שהקובץ לא נמצא או שאין הרשאה לגשת אליו
                </p>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <Button onClick={handleDownload} variant="default" size="sm" className="w-full md:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    הורדה
                  </Button>
                  <Button onClick={handleOpenInNewTab} variant="outline" size="sm" className="w-full md:w-auto">
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