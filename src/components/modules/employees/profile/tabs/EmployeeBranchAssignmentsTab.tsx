
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Employee } from '@/types/employee';

interface BranchAssignment {
  id: string;
  employee_id: string;
  branch_id: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  branch: {
    name: string;
  };
}

interface EmployeeBranchAssignmentsTabProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeBranchAssignmentsTab: React.FC<EmployeeBranchAssignmentsTabProps> = ({
  employee,
  employeeId
}) => {
  const assignments = employee.branch_assignments || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>שיוך לסניפים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{assignment.branch?.name || 'סניף לא ידוע'}</h4>
                <p className="text-sm text-gray-500">תפקיד: {assignment.role_name}</p>
              </div>
              <Badge variant={assignment.is_active ? "default" : "secondary"}>
                {assignment.is_active ? "פעיל" : "לא פעיל"}
              </Badge>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="text-gray-500 text-center py-4">אין שיוכים לסניפים</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
