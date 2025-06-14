
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
    <div className="bg-white rounded-xl shadow p-4 mb-3 flex flex-col gap-3 w-full overflow-x-hidden">
      {/* Header with select and status */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="accent-blue-600"
            aria-label="בחר עובד"
          />
          <div>
            <EmployeeListProfileCell employee={employee} />
          </div>
        </div>
        <EmployeeListStatusCell isActive={!!employee.is_active} />
      </div>

      {/* שדות - כל שדה שורה */}
      <div className="flex flex-col w-full gap-2 mt-2">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 mb-0.5">מספר עובד</span>
          <span className="font-medium text-sm break-words">
            {employee.employee_id || <span className="text-gray-400">לא הוגדר</span>}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 mb-0.5">טלפון</span>
          <div>
            <EmployeeListPhoneCell employee={employee} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 mb-0.5">סוג עובד</span>
          <EmployeeListTypeCell type={employee.employee_type} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 mb-0.5">סניף ראשי</span>
          <EmployeeListBranchCell employee={employee} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 mb-0.5">שעות שבועיות</span>
          <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
        {employee.hire_date && (
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 mb-0.5">תאריך תחילה</span>
            <span className="text-sm">{new Date(employee.hire_date).toLocaleDateString("he-IL")}</span>
          </div>
        )}
        {/* אפשר להוסיף כאן שדות נוספים אם צריך */}
      </div>

      <div className="mt-2 flex flex-col">
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
