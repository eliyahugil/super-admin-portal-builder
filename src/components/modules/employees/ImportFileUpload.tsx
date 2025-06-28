
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportFileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
}

export const ImportFileUpload: React.FC<ImportFileUploadProps> = ({
  onFileSelect,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      await processFile(uploadedFile);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    console.log('📄 File selected in upload step:', file.name);
    setError(null);
    setIsUploading(true);
    
    try {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        throw new Error('פורמט קובץ לא נתמך. אנא בחר קובץ Excel (.xlsx, .xls) או CSV בלבד.');
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('הקובץ גדול מדי. מקסימום 10MB מותר.');
      }

      // Check if file is actually empty
      if (file.size === 0) {
        throw new Error('הקובץ ריק. אנא בחר קובץ תקין עם נתונים.');
      }
      
      console.log('✅ File validation passed, uploading...');
      await onFileSelect(file);
      
    } catch (error) {
      console.error('💥 Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא צפויה בטעינת הקובץ';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div 
        className={`text-center p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isUploading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <FileSpreadsheet className={`h-16 w-16 mx-auto mb-4 ${
          isUploading ? 'text-blue-500' : 'text-gray-400'
        }`} />
        
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-lg font-medium text-blue-700">מעבד קובץ...</span>
            <p className="text-sm text-blue-600 mt-2">אנא המתן בזמן עיבוד הנתונים</p>
          </>
        ) : (
          <>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-xl font-medium text-gray-700">העלה קובץ Excel</span>
              <p className="text-sm text-gray-500 mt-2">לחץ כאן או גרור קובץ לאזור זה</p>
              <p className="text-xs text-gray-400 mt-1">קבצים נתמכים: .xlsx, .xls, .csv (מקסימום 10MB)</p>
            </Label>
          </>
        )}
        
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">אין לך קובץ? הורד תבנית מוכנה</p>
        <Button 
          variant="outline" 
          onClick={onDownloadTemplate} 
          className="flex items-center gap-2 mx-auto"
          disabled={isUploading}
        >
          <Download className="h-4 w-4" />
          הורד תבנית לדוגמה
        </Button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">טיפים לייבוא מוצלח:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• וודא שהשורה הראשונה מכילה כותרות עמודות</li>
          <li>• השתמש בשמות ברורים לעמודות (שם, אימייל, טלפון וכו')</li>
          <li>• וודא שיש לפחות שורה אחת של נתוני עובדים מתחת לכותרות</li>
          <li>• אל תשאיר שורות ריקות באמצע הקובץ</li>
          <li>• פורמט התאריכים: DD/MM/YYYY או DD-MM-YYYY</li>
        </ul>
      </div>
    </div>
  );
};
