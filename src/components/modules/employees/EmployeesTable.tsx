
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeesTableRow } from './table/EmployeesTableRow';
import { EmployeesMobileCard } from './table/EmployeesMobileCard';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
  console.log('📋 EmployeesTable rendering with employees:', employees.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>רשימת עובדים ({employees.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="bg-background" dir="rtl">
            {/* Header */}
            <div className="py-3 px-4 bg-muted/30 border-b border-border">
              <div className="text-sm font-medium text-foreground">
                רשימת עובדים ({employees.length})
              </div>
            </div>
            
            {/* Employee List */}
            <div className="bg-card">
              {employees.map((employee) => (
                <EmployeesMobileCard
                  key={employee.id}
                  employee={employee}
                  onRefetch={onRefetch}
                  showBranch={showBranchFilter}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
