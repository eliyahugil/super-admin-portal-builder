
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface EmployeeDocumentsTabProps {
  employeeId: string;
  employeeName: string;
}

export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({
  employeeId,
  employeeName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          מסמכים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין מסמכים</h3>
          <p className="text-gray-500">לא הועלו מסמכים עבור עובד זה</p>
        </div>
      </CardContent>
    </Card>
  );
};
