
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
      className="w-full max-w-full bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-4 px-4 py-5"
      style={{ fontSize: "17px", boxSizing: "border-box" }}
      dir="rtl"
    >
      {/* כותרת הכרטיס */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="accent-blue-600"
            aria-label="בחר עובד"
            style={{ minWidth: 22, minHeight: 22 }}
          />
          <div className="min-w-0 w-full">
            <EmployeeListProfileCell employee={employee} />
          </div>
        </div>
        <EmployeeListStatusCell isActive={!!employee.is_active} />
      </div>

      {/* פרטי עובד */}
      <div className="flex flex-col w-full gap-4 mt-1">
        <div className="flex flex-col">
          <span className="text-base text-gray-400 mb-1">מספר עובד</span>
          <span className="font-bold text-lg break-words w-full">
            {employee.employee_id || (
              <span className="text-gray-400">לא הוגדר</span>
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-base text-gray-400 mb-1">טלפון</span>
          <EmployeeListPhoneCell employee={employee} />
        </div>
        <div className="flex flex-col">
          <span className="text-base text-gray-400 mb-1">סוג עובד</span>
          <EmployeeListTypeCell type={employee.employee_type} />
        </div>
        <div className="flex flex-col">
          <span className="text-base text-gray-400 mb-1">סניף ראשי</span>
          <EmployeeListBranchCell employee={employee} />
        </div>
        <div className="flex flex-col">
          <span className="text-base text-gray-400 mb-1">שעות שבועיות</span>
          <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
        {employee.hire_date && (
          <div className="flex flex-col">
            <span className="text-base text-gray-400 mb-1">תאריך תחילה</span>
            <span className="text-lg break-words">
              {new Date(employee.hire_date).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}
      </div>

      {/* פעולות */}
      <div className="flex flex-col gap-3 w-full mt-4">
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
