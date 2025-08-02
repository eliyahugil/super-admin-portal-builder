import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeOverviewTab } from './tabs/EmployeeOverviewTab';
import { EmployeeAnalyticsTab } from './tabs/EmployeeAnalyticsTab';
import { EmployeeNotesTab } from './tabs/EmployeeNotesTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
import { EmployeeBranchAssignmentsTab } from './tabs/EmployeeBranchAssignmentsTab';
import { EmployeeSalaryTab } from './tabs/EmployeeSalaryTab';
import { EmployeeAttendanceTab } from './tabs/EmployeeAttendanceTab';
import { EmployeeShiftSubmissionsTab } from './tabs/EmployeeShiftSubmissionsTab';
import { EmployeeShiftSubmissionStats } from './tabs/EmployeeShiftSubmissionStats';
import { EmployeeProfileScheduleTab } from './schedule/EmployeeProfileScheduleTab';
import { EmployeeTokensTab } from './tabs/EmployeeTokensTab';
import { EmployeeSubmissionHistoryTab } from './tabs/EmployeeSubmissionHistoryTab';
import { EmployeeWorkOrderHistoryTab } from './tabs/EmployeeWorkOrderHistoryTab';
import { EmployeeShiftSettings } from '../EmployeeShiftSettings';
import { EmployeeCustomFields } from '../EmployeeCustomFields';
import type { Employee } from '@/types/employee';

interface EmployeeDropdownContentProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
  businessId: string;
  activeSection: string;
  onUpdate?: () => void;
}

export const EmployeeDropdownContent: React.FC<EmployeeDropdownContentProps> = ({
  employee,
  employeeId,
  employeeName,
  businessId,
  activeSection,
  onUpdate = () => {}
}) => {
  const navigate = useNavigate();
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <EmployeeOverviewTab employee={employee} employeeName={employeeName} />;
      
      case 'notes':
        return <EmployeeNotesTab employee={employee} employeeId={employeeId} employeeName={employeeName} />;
      
      case 'documents':
        return <EmployeeDocumentsTab employee={employee} employeeId={employeeId} employeeName={employeeName} />;
      
      case 'branches':
        return <EmployeeBranchAssignmentsTab employee={employee} employeeId={employeeId} />;
      
      case 'schedule':
        return <EmployeeProfileScheduleTab employee={employee} />;
      
      case 'attendance':
        return <EmployeeAttendanceTab employee={employee} employeeId={employeeId} employeeName={employeeName} />;
      
      case 'shifts':
        return (
          <div className="space-y-6">
            <EmployeeShiftSubmissionStats 
              employee={employee}
              employeeId={employeeId} 
              employeeName={employeeName}
            />
            <EmployeeShiftSubmissionsTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
          </div>
        );
      
      case 'tokens':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">טוקן אישי לעובד</h3>
                  <p className="text-blue-700 text-sm mt-1">לניהול מתקדם ותיקונים, עבור לעמוד הייעודי</p>
                </div>
                <button
                  onClick={() => navigate(`/modules/employees/tokens/${employeeId}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  פתח עמוד ייעודי
                </button>
              </div>
            </div>
            <EmployeeTokensTab employee={employee} employeeId={employeeId} employeeName={employeeName} />
          </div>
        );
      
      case 'shift-settings':
        return <EmployeeShiftSettings employee={employee} onUpdate={onUpdate} />;
      
      case 'salary':
        return <EmployeeSalaryTab employeeId={employeeId} employeeName={employeeName} />;
      
      case 'custom':
        return <EmployeeCustomFields employeeId={employeeId} businessId={businessId} />;
      
      case 'submission-history':
        return <EmployeeSubmissionHistoryTab employee={employee} employeeId={employeeId} employeeName={employeeName} />;
      
      case 'work-order-history':
        return <EmployeeWorkOrderHistoryTab employee={employee} employeeId={employeeId} employeeName={employeeName} />;
      
      case 'analytics':
        return <EmployeeAnalyticsTab employee={employee} />;
      
      default:
        return <EmployeeOverviewTab employee={employee} employeeName={employeeName} />;
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 overflow-hidden" dir="rtl">
      <div className="w-full overflow-x-auto">
        {renderContent()}
      </div>
    </div>
  );
};