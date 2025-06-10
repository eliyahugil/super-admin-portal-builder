
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeImportUploadStepProps {
  onFileUpload: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const EmployeeImportUploadStep: React.FC<EmployeeImportUploadStepProps> = ({
  onFileUpload,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    console.log('🔍 Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast({
        title: 'סוג קובץ לא נתמך',
        description: 'אנא בחר קובץ Excel (.xlsx, .xls) או CSV (.csv)',
        variant: 'destructive'
      });
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'קובץ גדול מדי',
        description: 'גודל הקובץ חייב להיות קטן מ-10MB',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', file.name);
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    const file = files[0];
    
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('🚀 Starting upload of file:', selectedFile.name);
      onFileUpload(selectedFile);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Drag and Drop Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center space-y-2">
            <FileText className="h-12 w-12 text-green-600" />
            <div>
              <p className="text-lg font-medium text-green-800">{selectedFile.name}</p>
              <p className="text-sm text-green-600">
                גודל: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              className="mt-4"
            >
              העלה קובץ ומשך למיפוי שדות
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">גרור קובץ Excel לכאן או לחץ לבחירה</p>
              <p className="text-sm text-gray-500 mt-2">
                קבצים נתמכים: .xlsx, .xls, .csv (עד 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Download Template Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={onDownloadTemplate} 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          הורד תבנית לדוגמה
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">הוראות העלאה:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• הקובץ חייב להכיל שורת כותרות</li>
          <li>• שורה ראשונה צריכה להכיל את שמות השדות</li>
          <li>• ניתן להשתמש בשמות בעברית או באנגלית</li>
          <li>• אחרי העלאה תוכל למפות את השדות למערכת</li>
        </ul>
      </div>
    </div>
  );
};
