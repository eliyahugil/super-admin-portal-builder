
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

interface EmployeeImportUploadStepProps {
  onFileUpload: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const EmployeeImportUploadStep: React.FC<EmployeeImportUploadStepProps> = ({
  onFileUpload,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      console.log('📄 File selected in upload step:', uploadedFile.name);
      
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = uploadedFile.name.toLowerCase().substring(uploadedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        alert('אנא בחר קובץ Excel או CSV תקין (.xlsx, .xls, .csv)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (uploadedFile.size > 10 * 1024 * 1024) {
        alert('קובץ גדול מדי - מקסימום 10MB');
        return;
      }
      
      console.log('✅ File validation passed, uploading...');
      onFileUpload(uploadedFile);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const uploadedFile = files[0];
      console.log('📄 File dropped:', uploadedFile.name);
      
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = uploadedFile.name.toLowerCase().substring(uploadedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        alert('אנא בחר קובץ Excel או CSV תקין (.xlsx, .xls, .csv)');
        return;
      }
      
      onFileUpload(uploadedFile);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileSpreadsheet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <span className="text-xl font-medium text-gray-700">העלה קובץ Excel</span>
          <p className="text-sm text-gray-500 mt-2">לחץ כאן או גרור קובץ לאזור זה</p>
          <p className="text-xs text-gray-400 mt-1">קבצים נתמכים: .xlsx, .xls, .csv (מקסימום 10MB)</p>
        </Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">אין לך קובץ? הורד תבנית מוכנה</p>
        <Button 
          variant="outline" 
          onClick={onDownloadTemplate} 
          className="flex items-center gap-2 mx-auto"
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
          <li>• וודא שאין שורות ריקות באמצע הקובץ</li>
          <li>• פורמט התאריכים: DD/MM/YYYY או DD-MM-YYYY</li>
        </ul>
      </div>
    </div>
  );
};
