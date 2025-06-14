
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { EmployeeListProfileCell } from './EmployeeListProfileCell';
import { EmployeeListPhoneCell } from './EmployeeListPhoneCell';
import { EmployeeListTypeCell } from './EmployeeListTypeCell';
import { EmployeeListBranchCell } from './EmployeeListBranchCell';
import { EmployeeListWeeklyHoursCell } from './EmployeeListWeeklyHoursCell';
import { EmployeeListStatusCell } from './EmployeeListStatusCell';
import { EmployeeListActionsCell } from './EmployeeListActionsCell';
import { EmployeeListCard } from './EmployeeListCard';
import type { Employee } from '@/types/employee';

interface EmployeeListTableProps {
  employees: Employee[];
  selectedEmployees: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
}

function useIsMobile() {
  // basic hook to detect mobile window! (server-safe)
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
}) => {
  const isMobile = useIsMobile();

  const allFilteredSelected = employees.length > 0 && employees.every(emp => selectedEmployees.has(emp.id));

  // Mobile view: show cards
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 w-full" dir="rtl">
        <div className="flex items-center justify-end mb-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={e => onSelectAll(e.target.checked)}
              className="accent-blue-600"
              aria-label="בחר/י הכל"
            />
            בחר/י הכל
          </label>
        </div>
        {employees.map(employee => (
          <EmployeeListCard
            key={employee.id}
            employee={employee}
            selected={selectedEmployees.has(employee.id)}
            onSelect={onSelectEmployee}
            onDeleteEmployee={onDeleteEmployee}
            onRefetch={onRefetch}
            loading={loading}
          />
        ))}
      </div>
    );
  }

  // Desktop view: table
  return (
    <div dir="rtl" className="overflow-x-auto w-full">
      <Table className="min-w-[750px] sm:min-w-full">
        <TableHeader>
          <TableRow dir="rtl">
            <TableHead className="w-12 text-right">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="text-right">שם מלא</TableHead>
            <TableHead className="text-right">מספר עובד</TableHead>
            <TableHead className="text-right">טלפון</TableHead>
            <TableHead className="text-right">סוג עובד</TableHead>
            <TableHead className="text-right">סניף</TableHead>
            <TableHead className="text-right">שעות שבועיות</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="text-right">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-gray-50" dir="rtl">
              <TableCell>
                <Checkbox
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={(checked) =>
                    onSelectEmployee(employee.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <EmployeeListProfileCell employee={employee} />
              </TableCell>
              <TableCell>
                {employee.employee_id || (
                  <span className="text-gray-400 text-sm">לא הוגדר</span>
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
