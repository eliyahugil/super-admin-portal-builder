
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface UnsubmittedEmployeesListProps {
  employees: Employee[];
}

export const UnsubmittedEmployeesList: React.FC<UnsubmittedEmployeesListProps> = ({
  employees
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          עובדים שלא הגישו
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {employees.map(employee => (
            <div key={employee.id} className="flex items-center justify-between text-sm">
              <span>{employee.first_name} {employee.last_name}</span>
              <Clock className="h-3 w-3 text-gray-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
