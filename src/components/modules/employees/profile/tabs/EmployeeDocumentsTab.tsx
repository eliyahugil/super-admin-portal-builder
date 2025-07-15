
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { EmployeeDocuments } from '../../EmployeeDocuments';
import { EmployeeFilesManager } from '../../EmployeeFilesManager';
import type { Employee } from '@/types/supabase';

interface EmployeeDocumentsTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

// כרטיסיית מסמכים בפרופיל עובד - כולל חתימות דיגיטליות וקבצים רגילים
export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Digital signatures and templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            מסמכים לחתימה ותבניות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeDocuments
            employeeId={employeeId}
            employeeName={employeeName}
            canEdit={true}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Regular files with visibility control */}
      <EmployeeFilesManager
        employee={employee}
        employeeId={employeeId}
        employeeName={employeeName}
      />
    </div>
  );
};
