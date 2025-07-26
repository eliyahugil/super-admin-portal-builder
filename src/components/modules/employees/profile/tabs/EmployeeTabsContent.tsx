
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { EmployeeNotes } from '../../EmployeeNotes';
import { EmployeeDocuments } from '../../EmployeeDocuments';
import { EmployeeBranchAssignments } from '../../EmployeeBranchAssignments';
import { SalaryHistory } from '../../SalaryHistory';


import { EmployeeCustomFields } from '../../EmployeeCustomFields';
import { EmployeeShiftSettings } from '../../EmployeeShiftSettings';
import { EmployeeOverviewTab } from './EmployeeOverviewTab';
import { EmployeeAnalyticsTab } from './EmployeeAnalyticsTab';
import { EmployeeNotesTab } from './EmployeeNotesTab';
import { EmployeeDocumentsTab } from './EmployeeDocumentsTab';
import { EmployeeBranchAssignmentsTab } from './EmployeeBranchAssignmentsTab';
import { EmployeeSalaryTab } from './EmployeeSalaryTab';
import { EmployeeAttendanceTab } from './EmployeeAttendanceTab';
import { EmployeeShiftSubmissionsTab } from './EmployeeShiftSubmissionsTab';
import { EmployeeShiftSubmissionStats } from './EmployeeShiftSubmissionStats';
import { EmployeeProfileScheduleTab } from '../schedule/EmployeeProfileScheduleTab';
import { EmployeeTokensTab } from './EmployeeTokensTab';
import { EmployeeSubmissionHistoryTab } from './EmployeeSubmissionHistoryTab';
import { EmployeeWorkOrderHistoryTab } from './EmployeeWorkOrderHistoryTab';
import type { Employee } from '@/types/employee';

interface EmployeeTabsContentProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
  businessId: string;
  onUpdate?: () => void;
}

export const EmployeeTabsContent: React.FC<EmployeeTabsContentProps> = ({
  employee,
  employeeId,
  employeeName,
  businessId,
  onUpdate = () => {}
}) => {
  return (
    <div dir="rtl">
      <TabsContent value="overview">
        <EmployeeOverviewTab employee={employee} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="notes">
        <EmployeeNotesTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="documents">
        <EmployeeDocumentsTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="branches">
        <EmployeeBranchAssignmentsTab employee={employee} employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="schedule">
        <EmployeeProfileScheduleTab employee={employee} />
      </TabsContent>

      <TabsContent value="attendance">
        <EmployeeAttendanceTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="shifts" className="space-y-6">
        <EmployeeShiftSubmissionStats 
          employee={employee}
          employeeId={employeeId} 
          employeeName={employeeName}
        />
        <EmployeeShiftSubmissionsTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="tokens">
        <EmployeeTokensTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="shift-settings">
        <EmployeeShiftSettings employee={employee} onUpdate={onUpdate} />
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

      <TabsContent value="submission-history">
        <EmployeeSubmissionHistoryTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="work-order-history">
        <EmployeeWorkOrderHistoryTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
      </TabsContent>

      <TabsContent value="analytics">
        <EmployeeAnalyticsTab employee={employee} />
      </TabsContent>
    </div>
  );
};
