
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { EmployeeListTableHeader } from './EmployeeListTableHeader';
import { EmployeeListProfileCell } from './EmployeeListProfileCell';
import { EmployeeListPhoneCell } from './EmployeeListPhoneCell';
import { EmployeeListTypeCell } from './EmployeeListTypeCell';
import { EmployeeListBranchCell } from './EmployeeListBranchCell';
import { EmployeeListWeeklyHoursCell } from './EmployeeListWeeklyHoursCell';
import { EmployeeListStatusCell } from './EmployeeListStatusCell';
import { EmployeeListActionsCell } from './EmployeeListActionsCell';
import { EmployeeListCard } from './EmployeeListCard';
import type { Employee } from '@/types/employee';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface EmployeeListTableProps {
  employees: Employee[];
  selectedEmployees: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
  // הוספת פרופס למיון
  sortBy: EmployeeListFilters['sortBy'];
  sortOrder: EmployeeListFilters['sortOrder'];
  onSort: (sortBy: EmployeeListFilters['sortBy']) => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // בדיקה ראשונית
    checkScreenSize();
    
    // האזנה לשינויי גודל
    window.addEventListener('resize', checkScreenSize);
    
    // ניקוי
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
}

export const EmployeeListTable: React.FC<EmployeeListTableProps> = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onDeleteEmployee,
  onRefetch,
  loading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const isMobile = useIsMobile();
  const allFilteredSelected = employees.length > 0 && employees.every(emp => selectedEmployees.has(emp.id));

  console.log('📊 EmployeeListTable render:', {
    employeesCount: employees.length,
    sortBy,
    sortOrder,
    firstEmployee: employees[0] ? `${employees[0].first_name} ${employees[0].last_name}` : 'none'
  });

  // Mobile view: show cards
  if (isMobile) {
    return (
      <div className="w-full bg-background min-h-screen" dir="rtl">
        {/* Header עם מספר עובדים */}
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b border-border">
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={e => onSelectAll(e.target.checked)}
                  className="w-5 h-5 accent-primary border-2 border-muted-foreground/30 rounded-md"
                  aria-label="בחר/י הכל"
                />
                <span className="text-lg font-semibold">
                  כל העובדים ({employees.length})
                </span>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                נבחרו: {selectedEmployees.size}
              </div>
            </div>
          </div>
        </div>
        
        {/* רשימת עובדים */}
        <div className="pb-20">
          {employees.map((employee, index) => (
            <div 
              key={employee.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <EmployeeListCard
                employee={employee}
                selected={selectedEmployees.has(employee.id)}
                onSelect={onSelectEmployee}
                onDeleteEmployee={onDeleteEmployee}
                onRefetch={onRefetch}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop view: table - הנתונים כבר ממוינים לכן אין צורך למיין שוב
  return (
    <div dir="rtl" className="overflow-x-auto w-full bg-background">
      <Table className="min-w-[750px] sm:min-w-full bg-card">
        <TableHeader className="bg-muted/30">
          <TableRow dir="rtl">
            <TableHead className="w-12 text-right">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <EmployeeListTableHeader
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50" dir="rtl">
              <TableCell>
                <Checkbox
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={(checked) =>
                    onSelectEmployee(employee.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium min-w-[180px] max-w-[280px]">
                <EmployeeListProfileCell employee={employee} />
              </TableCell>
              <TableCell>
                {employee.employee_id || (
                  <span className="text-muted-foreground text-sm">לא הוגדר</span>
                )}
              </TableCell>
              <TableCell>
                <EmployeeListPhoneCell employee={employee} />
              </TableCell>
              <TableCell>
                <EmployeeListTypeCell type={employee.employee_type} />
              </TableCell>
              <TableCell>
                <EmployeeListBranchCell employee={employee} />
              </TableCell>
              <TableCell>
                <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
              </TableCell>
              <TableCell>
                <EmployeeListStatusCell isActive={!!employee.is_active} />
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {new Date(employee.created_at).toLocaleDateString('he-IL')}
                </span>
              </TableCell>
              <TableCell>
                <EmployeeListActionsCell
                  employee={employee}
                  onDeleteEmployee={onDeleteEmployee}
                  onRefetch={onRefetch}
                  loading={loading}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
