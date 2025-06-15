
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';
import type { EmployeeFile } from '../hooks/useEmployeeFilesManagement';

interface EmployeeFilesCardProps {
  file: EmployeeFile;
  onDownload: (file: EmployeeFile) => void;
  onDelete: (file: EmployeeFile) => void;
  isDeleting: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const EmployeeFilesCard: React.FC<EmployeeFilesCardProps> = ({
  file,
  onDownload,
  onDelete,
  isDeleting,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <FileText className="h-8 w-8 text-blue-600" />
          <Badge variant="secondary">
            {file.file_type || 'קובץ'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2 truncate">{file.file_name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {file.employee && `${file.employee.first_name} ${file.employee.last_name}`}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          גודל: {formatFileSize(file.file_size)}
        </p>
        <p className="text-xs text-gray-500 mb-4">
          הועלה: {new Date(file.uploaded_at).toLocaleDateString('he-IL')}
        </p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onDownload(file)}
          >
            <Download className="h-4 w-4 ml-1" />
            הורד
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(file)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
