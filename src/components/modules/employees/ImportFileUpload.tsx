
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';

interface ImportFileUploadProps {
  onFileSelect: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const ImportFileUpload: React.FC<ImportFileUploadProps> = ({
  onFileSelect,
  onDownloadTemplate
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">העלאת קובץ אקסל</h3>
        <p className="text-gray-600 mb-4">
          בחר קובץ אקסל המכיל רשימת עובדים או גרור אותו לכאן
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">שחרר את הקובץ כאן...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              גרור קובץ אקסל לכאן או לחץ לבחירה
            </p>
            <p className="text-sm text-gray-500">
              נתמכים: .xlsx, .xls
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          הורד תבנית אקסל
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">טיפים לייבוא מוצלח:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• השתמש בתבנית האקסל המוכנה לתוצאות מיטביות</li>
          <li>• וודא שהשורה הראשונה מכילה כותרות עמודות</li>
          <li>• מלא לפחות שם פרטי ושם משפחה לכל עובד</li>
          <li>• השתמש בפורמט תאריך עקבי (יום/חודש/שנה)</li>
        </ul>
      </div>
    </div>
  );
};
