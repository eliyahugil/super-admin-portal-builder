
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BranchAssignment {
  id: string;
  role_name: string;
  is_active: boolean;
  branch: {
    id: string;
    name: string;
    address?: string;
  };
}

interface EmployeeBranchAssignmentsTabProps {
  assignments: BranchAssignment[];
}

export const EmployeeBranchAssignmentsTab: React.FC<EmployeeBranchAssignmentsTabProps> = ({
  assignments
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>שיוכים לסניפים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div>
                  <div>
                    <h4 className="font-medium">{assignment.branch.name}</h4>
                    <p className="text-sm text-gray-500">{assignment.role_name}</p>
                    {assignment.branch.address && (
                      <p className="text-xs text-gray-400">{assignment.branch.address}</p>
                    )}
                  </div>
                  <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                    {assignment.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                </div>
              </div>
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
