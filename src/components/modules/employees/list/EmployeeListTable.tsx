
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
import { useEmployeeListPreferences } from '@/hooks/useEmployeeListPreferences';
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
  const { preferences, updateFilters } = useEmployeeListPreferences();
  const allFilteredSelected = employees.length > 0 && employees.every(emp => selectedEmployees.has(emp.id));

  const handleSort = (sortBy: typeof preferences.filters.sortBy) => {
    const newSortOrder = 
      preferences.filters.sortBy === sortBy && preferences.filters.sortOrder === 'asc' 
        ? 'desc' 
        : 'asc';
    
    console.log('🔄 EmployeeListTable handleSort:', { sortBy, newSortOrder, currentSortBy: preferences.filters.sortBy });
    updateFilters({ sortBy, sortOrder: newSortOrder });
  };

  console.log('📊 EmployeeListTable render:', {
    employeesCount: employees.length,
    currentSort: preferences.filters.sortBy,
    currentOrder: preferences.filters.sortOrder,
    firstEmployee: employees[0] ? `${employees[0].first_name} ${employees[0].last_name}` : 'none'
  });

  // Mobile view: show cards in full width container
  if (isMobile) {
    return (
      <div 
        className="w-full" 
        dir="rtl"
        style={{
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <label className="flex items-center gap-2 text-lg">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={e => onSelectAll(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
              aria-label="בחר/י הכל"
            />
            <span>בחר/י הכל</span>
          </label>
        </div>
        
        <div className="space-y-3">
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
            <EmployeeListTableHeader
              sortBy={preferences.filters.sortBy}
              sortOrder={preferences.filters.sortOrder}
              onSort={handleSort}
            />
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
                <span className="text-sm text-gray-500">
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
