
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck } from 'lucide-react';

interface ImportedEmployee {
  name: string;
  email?: string;
  branch?: string;
}

interface ImportedEmployeesListProps {
  employees: ImportedEmployee[];
}

export const ImportedEmployeesList: React.FC<ImportedEmployeesListProps> = ({
  employees,
}) => {
  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          עובדים שיובאו בהצלחה ({employees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-48 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>סניף</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email || '-'}</TableCell>
                  <TableCell>{employee.branch || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
