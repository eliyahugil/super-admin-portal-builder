
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, FolderOpen } from 'lucide-react';
import { EmployeeTemplateSelector } from '../../EmployeeTemplateSelector';
import { EmployeeDocuments } from '../../EmployeeDocuments';
import { EmployeeAdvancedFileManager } from '../../EmployeeAdvancedFileManager';
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
      {/* Template selector for employee */}
      <EmployeeTemplateSelector
        employeeId={employeeId}
        employeeName={employeeName}
      />

      <Separator />

      {/* Signed documents and signature status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            מסמכים שנשלחו לחתימה
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

      <Separator />

      {/* File management with tabs */}
      <EmployeeAdvancedFileManager
        employee={employee}
        employeeId={employeeId}
        employeeName={employeeName}
        showApprovalSystem={true}
      />
    </div>
  );
};
