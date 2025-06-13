
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import type { Employee } from '@/types/supabase';

interface EmployeeBranchAssignmentsTabProps {
  employee: Employee;
  employeeId: string;
}

export const EmployeeBranchAssignmentsTab: React.FC<EmployeeBranchAssignmentsTabProps> = ({
  employee,
  employeeId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          שיוכי סניפים
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employee.branch_assignments && employee.branch_assignments.length > 0 ? (
          <div className="space-y-4">
            {employee.branch_assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{assignment.branch.name}</h4>
                    <p className="text-sm text-gray-500">{assignment.role_name}</p>
                  </div>
                  <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                    {assignment.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין שיוכים</h3>
            <p className="text-gray-500">העובד לא משויך לאף סניף</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
