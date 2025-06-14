
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { EmployeeFile } from '../types';
import { formatFileSize, getFileTypeLabel } from '../utils';

interface EmployeeFileCardProps {
  file: EmployeeFile;
  onDownload: (file: EmployeeFile) => void;
}

export const EmployeeFileCard: React.FC<EmployeeFileCardProps> = ({ file, onDownload }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className="text-xs">
            {getFileTypeLabel(file.file_type)}
          </Badge>
          <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
        </div>
        
        <h4 className="font-medium text-sm mb-2 truncate text-right" title={file.file_name}>
          {file.file_name}
        </h4>
        
        <div className="space-y-1 text-xs text-gray-500 mb-3 text-right">
          <div>גודל: {formatFileSize(file.file_size)}</div>
          <div className="flex items-center gap-1 justify-end">
            <span>
              {format(new Date(file.uploaded_at), 'dd/MM/yyyy', { locale: he })}
            </span>
            <Calendar className="h-3 w-3" />
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => onDownload(file)}
        >
          <span className="mr-1">הורד</span>
          <Download className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
