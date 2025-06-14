
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface EmployeeSelectorProps {
  employees: Employee[];
  employeesLoading: boolean;
  selectedEmployeeId: string;
  onSelectionChange: (employeeId: string) => void;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  employeesLoading,
  selectedEmployeeId,
  onSelectionChange
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">בחר עובד לחתימה:</label>
      <Select value={selectedEmployeeId} onValueChange={onSelectionChange}>
        <SelectTrigger>
          <SelectValue placeholder="בחר עובד..." />
        </SelectTrigger>
        <SelectContent>
          {employeesLoading ? (
            <SelectItem value="" disabled>טוען עובדים...</SelectItem>
          ) : (
            employees?.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
                {employee.employee_id && ` (${employee.employee_id})`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
