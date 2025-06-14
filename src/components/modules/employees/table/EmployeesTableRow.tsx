import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmployeeRowActions } from './row/EmployeeRowActions';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  employee_type: string;
  is_active: boolean;
  main_branch?: {
    name: string;
  };
  employee_branch_assignments?: Array<{
    branch: {
      name: string;
    };
  }>;
}

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
  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      contractor: 'קבלן',
      intern: 'מתמחה',
    };
    return types[type] || type;
  };

  const getBranchName = () => {
    if (employee.main_branch?.name) {
      return employee.main_branch.name;
    }
    if (employee.employee_branch_assignments?.[0]?.branch?.name) {
      return employee.employee_branch_assignments[0].branch.name;
    }
    return 'לא משויך';
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {employee.first_name} {employee.last_name}
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
        <Badge variant={employee.is_active ? "default" : "secondary"}>
          {employee.is_active ? 'פעיל' : 'לא פעיל'}
        </Badge>
      </TableCell>
      <TableCell>
        <EmployeeRowActions employee={employee} onRefetch={onRefetch} />
      </TableCell>
    </TableRow>
  );
};
