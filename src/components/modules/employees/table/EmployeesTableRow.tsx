
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmployeeRowActions } from './row/EmployeeRowActions';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '@/types/employee';

interface EmployeesTableRowProps {
  employee: Employee;
  onRefetch: () => void;
  showBranch?: boolean;
}

export const EmployeesTableRow: React.FC<EmployeesTableRowProps> = ({ 
  employee, 
  onRefetch,
  showBranch = true 
}) => {
  const navigate = useNavigate();
  
  console.log('📋 EmployeesTableRow rendering employee:', employee.first_name, employee.last_name);

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      contractor: 'קبלן',
      youth: 'נוער',
    };
    return types[type] || type;
  };

  const getBranchName = () => {
    if (employee.main_branch?.name) {
      return employee.main_branch.name;
    }
    if (employee.branch_assignments?.[0]?.branch?.name) {
      return employee.branch_assignments[0].branch.name;
    }
    return 'לא משויך';
  };

  const handleNameClick = () => {
    const profilePath = `/modules/employees/profile/${employee.id}`;
    console.log('🔗 Navigating to employee profile from name click:', {
      employeeId: employee.id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      targetPath: profilePath
    });
    navigate(profilePath);
  };

  // Handle optional is_active with proper default
  const isActive = employee.is_active ?? true;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <button
          onClick={handleNameClick}
          className="text-blue-600 hover:text-blue-800 hover:underline text-right font-medium"
        >
          {employee.first_name} {employee.last_name}
        </button>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {employee.email && <div>{employee.email}</div>}
          {employee.phone && <div>{employee.phone}</div>}
        </div>
      </TableCell>
      {showBranch && (
        <TableCell>
          <span className="text-sm text-gray-600">{getBranchName()}</span>
        </TableCell>
      )}
      <TableCell>
        <Badge variant="outline">
          {getEmployeeTypeLabel(employee.employee_type)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? 'פעיל' : 'לא פעיל'}
        </Badge>
      </TableCell>
      <TableCell>
        <EmployeeRowActions employee={employee} onTokenSent={onRefetch} />
      </TableCell>
    </TableRow>
  );
};
