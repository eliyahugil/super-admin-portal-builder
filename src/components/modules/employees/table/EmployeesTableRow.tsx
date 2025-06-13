
import React from 'react';
import { EmployeeBasicInfo } from './row/EmployeeBasicInfo';
import { EmployeeContactInfo } from './row/EmployeeContactInfo';
import { EmployeeStatusBadges } from './row/EmployeeStatusBadges';
import { EmployeeBranchInfo } from './row/EmployeeBranchInfo';
import { EmployeeWorkInfo } from './row/EmployeeWorkInfo';
import { EmployeeQuickStats } from './row/EmployeeQuickStats';
import { EmployeeRowActions } from './row/EmployeeRowActions';
import type { Employee } from '@/types/employee';

interface EmployeesTableRowProps {
  employee: Employee;
  onTokenSent: () => void;
  onDelete?: (employee: Employee) => void;
}

export const EmployeesTableRow: React.FC<EmployeesTableRowProps> = ({
  employee,
  onTokenSent,
  onDelete
}) => {
  return (
    <tr className="hover:bg-gray-50 border-b">
      {/* Employee Basic Info */}
      <td className="px-4 py-3">
        <EmployeeBasicInfo
          firstName={employee.first_name}
          lastName={employee.last_name}
          employeeId={employee.employee_id}
        />
      </td>

      {/* Contact Info */}
      <td className="px-4 py-3">
        <EmployeeContactInfo
          phone={employee.phone}
          email={employee.email}
        />
      </td>

      {/* Status & Type */}
      <td className="px-4 py-3">
        <EmployeeStatusBadges
          isActive={employee.is_active ?? true}
          employeeType={employee.employee_type}
        />
      </td>

      {/* Branch Info */}
      <td className="px-4 py-3">
        <EmployeeBranchInfo
          mainBranch={employee.main_branch}
          branchAssignments={employee.branch_assignments}
        />
      </td>

      {/* Work Info */}
      <td className="px-4 py-3">
        <EmployeeWorkInfo
          hireDate={employee.hire_date}
          weeklyHoursRequired={employee.weekly_hours_required}
        />
      </td>

      {/* Quick Stats */}
      <td className="px-4 py-3">
        <EmployeeQuickStats
          weeklyTokens={employee.weekly_tokens}
          employeeNotes={employee.employee_notes}
        />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <EmployeeRowActions
          employee={employee}
          onTokenSent={onTokenSent}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
};
