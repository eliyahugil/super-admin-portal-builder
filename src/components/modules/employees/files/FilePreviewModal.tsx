import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
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
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Define file type interface
interface FileData {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string | null;
  uploaded_by: string;
}

interface VisibilityToggleProps {
  fileId: string;
  isVisible: boolean;
  onVisibilityChange: (fileId: string, isVisible: boolean) => void;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ fileId, isVisible, onVisibilityChange }) => {
  const handleToggleVisibility = () => {
    onVisibilityChange(fileId, !isVisible);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleVisibility}
      className="hover:bg-secondary/50"
    >
      {isVisible ? (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="sr-only">הסתר קובץ</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span className="sr-only">הצג קובץ</span>
        </>
      )}
    </Button>
  );
};

interface ShareFileProps {
  fileId: string;
}

const ShareFile: React.FC<ShareFileProps> = ({ fileId }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const fileUrl = `${window.location.origin}/files/${fileId}`;
    try {
      await navigator.clipboard.writeText(fileUrl);
      setIsCopied(true);
      toast({
        title: "הקישור הועתק!",
        description: "שתף את הקישור עם חברי הצוות שלך.",
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "אופס! משהו השתבש.",
        description: "לא ניתן להעתיק את הקישור.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleShare} disabled={isCopied} className="hover:bg-secondary/50">
      <Share2 className="h-4 w-4" />
      <span className="sr-only">{isCopied ? "Copied!" : "Share file"}</span>
    </Button>
  );
};

interface FilePreviewModalProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
  onVisibilityToggle?: (fileId: string, isVisible: boolean) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ 
  file, 
  isOpen, 
  onClose,
  onVisibilityToggle 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const { toast } = useToast();

  const getFileTypeInfo = useCallback((currentFile: FileData) => {
    const fileType = currentFile.file_type?.toLowerCase();
    const fileName = currentFile.file_name.toLowerCase();
    
    // Check if it's an image
    const isImage = fileType?.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(fileName);
    
    // Check if it's a PDF
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
    
    // Check if it's a text file
    const isText = fileType?.startsWith('text/') || 
      /\.(txt|csv|json|xml|html|css|js|ts|md|log)$/i.test(fileName);

    return { isImage, isPdf, isText };
  }, []);

  const loadPreview = useCallback(async (currentFile: FileData) => {
    if (!currentFile) return;
    
    setIsLoading(true);
    setError('');
    
    const { isImage, isPdf, isText } = getFileTypeInfo(currentFile);
    
    console.log('🔍 Loading preview for file:', {
      name: currentFile.file_name,
      type: currentFile.file_type,
      path: currentFile.file_path,
      isImage,
      isPdf,
      isText
    });

    try {
      // Download the file and create a blob URL
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(currentFile.file_path);

      if (error) {
        console.error('❌ Error downloading file:', error);
        throw error;
      }

      console.log('✅ File downloaded successfully, size:', data.size);
      
      // Create blob URL
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      
      console.log('✅ Preview URL created:', url);
      console.log('✅ File type detected:', {
        isImage,
        isPdf,
        isText,
        fileType: currentFile.file_type
      });
    } catch (error: any) {
      console.error('❌ Error loading preview:', error);
      toast({
        title: "שגיאה בטעינת הקובץ",
        description: error.message || "לא ניתן לטעון את הקובץ לתצוגה מקדימה",
        variant: "destructive",
      });
      setError(error.message || "לא ניתן לטעון את הקובץ");
    } finally {
      setIsLoading(false);
    }
  }, [getFileTypeInfo, toast]);

  useEffect(() => {
    if (file && isOpen) {
      loadPreview(file);
    }
    
    // Cleanup blob URL on unmount or when file changes
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, isOpen, loadPreview]);

  // Cleanup blob URL when modal closes
  useEffect(() => {
    if (!isOpen && previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  }, [isOpen, previewUrl]);

  const handleDownload = useCallback(async () => {
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
        title: "הקובץ הורד בהצלחה",
        description: `${file.file_name} נשמר במחשב שלך`,
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "שגיאה בהורדת הקובץ",
        description: error.message || "לא ניתן להוריד את הקובץ",
        variant: "destructive",
      });
    }
  }, [file, toast]);

  const handleOpenInNewTab = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  }, [previewUrl]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'לא ידוע';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!file) return null;

  const { isImage, isPdf, isText } = getFileTypeInfo(file);

  // PDF event handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages));
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {isImage && <ImageIcon className="h-5 w-5" />}
              {isPdf && <FileText className="h-5 w-5" />}
              {isText && <FileText className="h-5 w-5" />}
              {file.file_name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                הורד
              </Button>
              <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                פתח בטאב חדש
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>גודל:</span>
              <Badge variant="secondary">{formatFileSize(file.file_size || 0)}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{file.uploaded_at ? formatDate(file.uploaded_at) : 'לא ידוע'}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">טוען...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">שגיאה בטעינת הקובץ</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => loadPreview(file)} variant="outline">
                  נסה שוב
                </Button>
              </div>
            </div>
          ) : !previewUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">אין תצוגה מקדימה</h3>
                <p className="text-muted-foreground">לא ניתן להציג קובץ זה</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {isImage ? (
                <div className="flex items-center justify-center h-full p-4">
                  <img 
                    src={previewUrl} 
                    alt={file.file_name}
                    className="max-w-full max-h-full object-contain"
                    onLoad={() => console.log('✅ Image loaded successfully')}
                    onError={() => console.error('❌ Image failed to load')}
                  />
                </div>
              ) : isPdf ? (
                <div className="h-full flex flex-col">
                  {/* PDF Controls */}
                  <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={previousPage} 
                        disabled={pageNumber <= 1}
                        variant="outline" 
                        size="sm"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        עמוד {pageNumber} מתוך {numPages}
                      </span>
                      <Button 
                        onClick={nextPage} 
                        disabled={pageNumber >= numPages}
                        variant="outline" 
                        size="sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button onClick={zoomOut} variant="outline" size="sm">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button onClick={zoomIn} variant="outline" size="sm">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* PDF Document */}
                  <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-800">
                    <div className="flex justify-center">
                      <Document
                        file={previewUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => {
                          console.error('❌ PDF load error:', error);
                          setError('שגיאה בטעינת PDF');
                        }}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">שגיאה בטעינת PDF</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              לא ניתן להציג את ה-PDF במוקד זה
                            </p>
                            <div className="flex gap-2">
                              <Button onClick={handleOpenInNewTab} variant="default" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                פתח בטאב חדש
                              </Button>
                              <Button onClick={handleDownload} variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                הורד קובץ
                              </Button>
                            </div>
                          </div>
                        }
                      >
                        <Page 
                          pageNumber={pageNumber} 
                          scale={scale}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      </Document>
                    </div>
                  </div>
                </div>
              ) : isText ? (
                <div className="h-full p-4">
                  <iframe 
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title={file.file_name}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">סוג קובץ לא נתמך</h3>
                    <p className="text-muted-foreground mb-4">
                      לא ניתן להציג תצוגה מקדימה עבור סוג קובץ זה
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleDownload} variant="default" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        הורד קובץ
                      </Button>
                      <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        פתח בטאב חדש
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
