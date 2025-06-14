
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeesTableRow } from './table/EmployeesTableRow';
import type { Employee } from '@/types/employee';

interface EmployeesTableProps {
  employees: Employee[];
  onRefetch: () => void;
  showBranchFilter?: boolean;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({ 
  employees, 
  onRefetch,
  showBranchFilter = true 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>רשימת עובדים ({employees.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם מלא</TableHead>
              <TableHead>פרטי קשר</TableHead>
              {showBranchFilter && <TableHead>סניף ראשי</TableHead>}
              <TableHead>סוג עובד</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <EmployeesTableRow
                key={employee.id}
                employee={employee}
                onRefetch={onRefetch}
                showBranch={showBranchFilter}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
