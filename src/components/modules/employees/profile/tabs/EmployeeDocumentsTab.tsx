
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { EmployeeDocuments } from '../../EmployeeDocuments';

interface EmployeeDocumentsTabProps {
  employeeId: string;
  employeeName: string;
}

// כרטיסיית מסמכים בפרופיל עובד - קריאה בלבד (לראות סטטוס מסמכים)
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
        <EmployeeDocuments
          employeeId={employeeId}
          employeeName={employeeName}
          canEdit={false}
        />
      </CardContent>
    </Card>
  );
};
