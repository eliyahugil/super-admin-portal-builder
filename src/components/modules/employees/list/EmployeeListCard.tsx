
import React from "react";
import { Employee } from "@/types/employee";
import { EmployeeListProfileCell } from "./EmployeeListProfileCell";
import { EmployeeListPhoneCell } from "./EmployeeListPhoneCell";
import { EmployeeListTypeCell } from "./EmployeeListTypeCell";
import { EmployeeListBranchCell } from "./EmployeeListBranchCell";
import { EmployeeListWeeklyHoursCell } from "./EmployeeListWeeklyHoursCell";
import { EmployeeListStatusCell } from "./EmployeeListStatusCell";
import { EmployeeListActionsCell } from "./EmployeeListActionsCell";

interface EmployeeListCardProps {
  employee: Employee;
  selected: boolean;
  onSelect: (employeeId: string, checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
}

export const EmployeeListCard: React.FC<EmployeeListCardProps> = ({
  employee,
  selected,
  onSelect,
  onDeleteEmployee,
  onRefetch,
  loading,
}) => {
  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-3"
      dir="rtl"
      style={{
        minWidth: 0,
        maxWidth: '100%',
        overflowX: 'hidden'
      }}
    >
      {/* Header: checkbox, name and status */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="mt-1 w-5 h-5 accent-blue-600 border-2 border-gray-300 rounded"
            aria-label="בחר עובד"
          />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-gray-900 break-words leading-tight">
              {`${employee.first_name} ${employee.last_name}`}
            </div>
            {employee.email && (
              <div className="text-base text-gray-600 mt-1 break-words">
                {employee.email}
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <EmployeeListStatusCell isActive={!!employee.is_active} />
        </div>
      </div>

      {/* Employee details in clear rows */}
      <div className="space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <div className="text-base font-medium text-gray-500 mb-1">מספר עובד</div>
          <div className="text-lg font-semibold text-gray-900">
            {employee.employee_id || (
              <span className="text-gray-400 font-normal">לא הוגדר</span>
            )}
          </div>
        </div>

        <div className="border-b border-gray-100 pb-3">
          <div className="text-base font-medium text-gray-500 mb-1">טלפון</div>
          <div className="text-lg">
            <EmployeeListPhoneCell employee={employee} />
          </div>
        </div>

        <div className="border-b border-gray-100 pb-3">
          <div className="text-base font-medium text-gray-500 mb-1">סוג עובד</div>
          <div className="text-lg">
            <EmployeeListTypeCell type={employee.employee_type} />
          </div>
        </div>

        <div className="border-b border-gray-100 pb-3">
          <div className="text-base font-medium text-gray-500 mb-1">סניף ראשי</div>
          <div className="text-lg">
            <EmployeeListBranchCell employee={employee} />
          </div>
        </div>

        <div className="border-b border-gray-100 pb-3">
          <div className="text-base font-medium text-gray-500 mb-1">שעות שבועיות</div>
          <div className="text-lg">
            <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
          </div>
        </div>

        {employee.hire_date && (
          <div className="border-b border-gray-100 pb-3">
            <div className="text-base font-medium text-gray-500 mb-1">תאריך תחילה</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(employee.hire_date).toLocaleDateString("he-IL")}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <EmployeeListActionsCell
          employee={employee}
          onDeleteEmployee={onDeleteEmployee}
          onRefetch={onRefetch}
          loading={loading}
        />
      </div>
    </div>
  );
};
