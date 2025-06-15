
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, FileCheck, Users } from 'lucide-react';
import { GroupedFiles } from '../types';

interface EmployeeFilesStatsProps {
  groupedFiles: GroupedFiles[];
}

export const EmployeeFilesStats: React.FC<EmployeeFilesStatsProps> = ({ groupedFiles }) => {
  const totalEmployees = groupedFiles.length;
  const totalFiles = groupedFiles.reduce((sum, group) => sum + group.files.length, 0);
  const totalSignedDocs = groupedFiles.reduce((sum, group) => sum + group.signedDocuments.length, 0);
  const totalItems = totalFiles + totalSignedDocs;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">{totalEmployees}</div>
          <div className="text-sm text-gray-600">עובדים עם קבצים</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-600">{totalFiles}</div>
          <div className="text-sm text-gray-600">קבצים שהועלו</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <FileCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{totalSignedDocs}</div>
          <div className="text-sm text-gray-600">מסמכים חתומים</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="h-8 w-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-bold">Σ</span>
          </div>
          <div className="text-2xl font-bold text-gray-600">{totalItems}</div>
          <div className="text-sm text-gray-600">סה"כ פריטים</div>
        </CardContent>
      </Card>
    </div>
  );
};
