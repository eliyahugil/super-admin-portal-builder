
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

interface ImportFileUploadProps {
  onFileSelect: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const ImportFileUpload: React.FC<ImportFileUploadProps> = ({
  onFileSelect,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            העלאת קובץ עובדים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">בחר קובץ Excel לייבוא</p>
              <p className="text-sm text-gray-500">
                נתמכים: .xlsx, .xls, .csv (עד 10MB)
              </p>
            </div>
            <Button onClick={handleUploadClick} className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              בחר קובץ
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תבנית ייבוא</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            הורד תבנית Excel כדי לוודא שהקובץ שלך מכיל את כל השדות הנדרשים
          </p>
          <Button variant="outline" onClick={onDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            הורד תבנית
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
