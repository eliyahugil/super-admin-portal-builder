
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
  loading
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={e => onSelect(employee.id, e.target.checked)}
            className="accent-blue-600"
            aria-label="בחר עובד"
          />
          <span className="font-medium text-base">
            <EmployeeListProfileCell employee={employee} />
          </span>
        </div>
        <EmployeeListStatusCell isActive={!!employee.is_active} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
        <div className="flex-1 min-w-[140px] flex gap-1 items-center">
          <span className="font-semibold">מס' עובד:</span>
          {employee.employee_id || <span className="text-gray-400">לא הוגדר</span>}
        </div>
        <div className="flex-1 min-w-[140px] flex gap-1 items-center">
          <span className="font-semibold">טלפון:</span>
          <EmployeeListPhoneCell employee={employee} />
        </div>
        <div className="flex-1 min-w-[120px] flex gap-1 items-center">
          <span className="font-semibold">סוג:</span>
          <EmployeeListTypeCell type={employee.employee_type} />
        </div>
        <div className="flex-1 min-w-[120px] flex gap-1 items-center">
          <span className="font-semibold">סניף:</span>
          <EmployeeListBranchCell employee={employee} />
        </div>
        <div className="flex-1 min-w-[120px] flex gap-1 items-center">
          <span className="font-semibold">שעות שבועיות:</span>
          <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
      </div>
      <div className="mt-2">
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
