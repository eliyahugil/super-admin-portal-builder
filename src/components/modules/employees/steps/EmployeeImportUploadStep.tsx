
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Download } from 'lucide-react';

interface EmployeeImportUploadStepProps {
  onFileUpload: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const EmployeeImportUploadStep: React.FC<EmployeeImportUploadStepProps> = ({
  onFileUpload,
  onDownloadTemplate,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      console.log('📄 File selected in upload step:', uploadedFile.name);
      onFileUpload(uploadedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <span className="text-lg font-medium">העלה קובץ Excel</span>
          <p className="text-sm text-gray-500 mt-2">קבצים נתמכים: .xlsx, .xls, .csv</p>
        </Label>
        <Input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
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
    </div>
  );
};
