
import React from 'react';
import { EmployeesTableRow } from './EmployeesTableRow';
import type { Employee } from '@/types/employee';

interface EmployeesTableGridProps {
  employees: Employee[];
  onRefetch: () => void;
}

export const EmployeesTableGrid: React.FC<EmployeesTableGridProps> = ({
  employees,
  onRefetch,
}) => {
  console.log('📊 EmployeesTableGrid rendering with employees:', employees.length);

  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" dir="rtl">
        <p>לא נמצאו עובדים</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full" dir="rtl">
      <table className="w-full min-w-[750px] sm:min-w-full border-collapse bg-white" dir="rtl">
        <thead>
          <tr className="bg-gray-50 border-b" dir="rtl">
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">פרטי עובד</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">קשר</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">סטטוס וסוג</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">סניף</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">פרטי עבודה</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">סטטיסטיקות</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <EmployeesTableRow
              key={employee.id}
              employee={employee}
              onRefetch={onRefetch}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
