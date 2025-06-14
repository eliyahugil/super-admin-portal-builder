
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { EmployeeNotes } from '../../EmployeeNotes';
import { EmployeeDocuments } from '../../EmployeeDocuments';
import { EmployeeBranchAssignments } from '../../EmployeeBranchAssignments';
import { SalaryHistory } from '../../SalaryHistory';
import { RecentAttendance } from '../../RecentAttendance';
import { ShiftSubmissionHistory } from '../../ShiftSubmissionHistory';
import { EmployeeTokenManager } from '../../EmployeeTokenManager';
import { EmployeeCustomFields } from '../../EmployeeCustomFields';
import { EmployeeOverviewTab } from './EmployeeOverviewTab';
import { EmployeeAnalyticsTab } from './EmployeeAnalyticsTab';
import { EmployeeNotesTab } from './EmployeeNotesTab';
import { EmployeeDocumentsTab } from './EmployeeDocumentsTab';
import { EmployeeBranchAssignmentsTab } from './EmployeeBranchAssignmentsTab';
import { EmployeeSalaryTab } from './EmployeeSalaryTab';
import type { Employee } from '@/types/employee';

interface EmployeeTabsContentProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
  businessId: string;
}

export const EmployeeTabsContent: React.FC<EmployeeTabsContentProps> = ({
  employee,
  employeeId,
  employeeName,
  businessId
}) => {
  return (
    <div dir="rtl">
      <TabsContent value="overview" className="mt-6">
        <EmployeeOverviewTab employee={employee} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="notes">
        <EmployeeNotesTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="documents">
        <EmployeeDocumentsTab employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="branches">
        <EmployeeBranchAssignmentsTab employee={employee} employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="attendance">
        <RecentAttendance employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="shifts">
        <ShiftSubmissionHistory employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="tokens">
        <EmployeeTokenManager 
          employeeId={employeeId} 
          employeeName={employeeName}
          phone={employee.phone}
        />
      </TabsContent>

      <TabsContent value="salary">
        <EmployeeSalaryTab employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="custom">
        <EmployeeCustomFields 
          employeeId={employeeId} 
          businessId={businessId}
        />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <EmployeeAnalyticsTab employee={employee} />
      </TabsContent>
    </div>
  );
};
