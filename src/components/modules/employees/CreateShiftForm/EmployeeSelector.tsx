
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
}

interface EmployeeSelectorProps {
  selectedEmployeeId: string;
  onEmployeeChange: (value: string) => void;
  employees: Employee[] | undefined;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  selectedEmployeeId,
  onEmployeeChange,
  employees
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="employee" className="text-sm text-gray-600">עובד (אופציונלי)</Label>
      <Select value={selectedEmployeeId} onValueChange={onEmployeeChange}>
        <SelectTrigger className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <SelectValue placeholder="בחר עובד (ניתן להשאיר ריק)" />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-xl shadow-lg border z-50">
          {employees?.map((employee) => (
            <SelectItem key={employee.id} value={employee.id} className="p-3 hover:bg-gray-50">
              {employee.first_name} {employee.last_name}
              {employee.employee_id && ` (${employee.employee_id})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
