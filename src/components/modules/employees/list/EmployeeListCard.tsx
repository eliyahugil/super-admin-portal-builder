
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
      className={`
        w-full
        bg-white
        border border-gray-200
        rounded-2xl
        shadow-sm
        flex flex-col
        gap-4
        px-2 py-3 sm:px-4 sm:py-5
        overflow-x-visible
        box-border
        min-w-0
        max-w-full
      `}
      dir="rtl"
      style={{
        fontSize: "18px",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      {/* Header: employee selection and status */}
      <div className="flex flex-row items-center justify-between w-full gap-3 min-w-0">
        <div className="flex flex-row items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="accent-blue-600 border-2 border-gray-300 rounded-md"
            style={{ minWidth: 28, minHeight: 28, width: 28, height: 28 }}
            aria-label="בחר עובד"
          />
          <div className="min-w-0 w-full overflow-hidden">
            <EmployeeListProfileCell employee={employee} />
          </div>
        </div>
        <div className="flex-shrink-0 min-w-fit">
          <EmployeeListStatusCell isActive={!!employee.is_active} />
        </div>
      </div>
      {/* פרטי עובד, בתצוגה ברורה ובשורות ברורות */}
      <div className="flex flex-col w-full gap-4 mt-2" style={{ minWidth: 0 }}>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[17px] font-medium text-gray-500">מספר עובד</span>
          <span className="font-extrabold text-lg break-words w-full">
            {employee.employee_id || (
              <span className="text-gray-400 font-normal">לא הוגדר</span>
            )}
          </span>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[17px] font-medium text-gray-500">טלפון</span>
          <EmployeeListPhoneCell employee={employee} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[17px] font-medium text-gray-500">סוג עובד</span>
          <EmployeeListTypeCell type={employee.employee_type} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[17px] font-medium text-gray-500">סניף ראשי</span>
          <EmployeeListBranchCell employee={employee} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[17px] font-medium text-gray-500">שעות שבועיות</span>
          <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
        {employee.hire_date && (
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[17px] font-medium text-gray-500">תאריך תחילה</span>
            <span className="font-semibold text-lg break-words">
              {new Date(employee.hire_date).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}
      </div>
      {/* פעולות */}
      <div className="flex flex-col gap-3 w-full mt-3 min-w-0">
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
