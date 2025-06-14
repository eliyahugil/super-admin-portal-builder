
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
      className="rounded-2xl shadow bg-white w-full max-w-full overflow-x-hidden px-3 py-3 flex flex-col gap-3
        sm:px-4 sm:py-3
        "
      style={{
        fontSize: "16px", // ברירת מחדל מובייל
      }}
    >
      {/* כותרת הכרטיס */}
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="accent-blue-600"
            aria-label="בחר עובד"
            style={{ minWidth: 18, minHeight: 18 }}
          />
          <div className="min-w-0 w-full">
            <EmployeeListProfileCell employee={employee} />
          </div>
        </div>
        <EmployeeListStatusCell isActive={!!employee.is_active} />
      </div>

      {/* פירוט עובד – תמיד טור אנכי, עם טקסט יותר גדול ובלי גלילה לרוחב */}
      <div className="flex flex-col w-full gap-2 mt-1 min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-[11px] text-gray-400 mb-0.5">מספר עובד</span>
          <span className="font-medium text-base break-words w-full">{employee.employee_id || <span className="text-gray-400">לא הוגדר</span>}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-[11px] text-gray-400 mb-0.5">טלפון</span>
          <EmployeeListPhoneCell employee={employee} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-[11px] text-gray-400 mb-0.5">סוג עובד</span>
          <EmployeeListTypeCell type={employee.employee_type} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-[11px] text-gray-400 mb-0.5">סניף ראשי</span>
          <EmployeeListBranchCell employee={employee} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-[11px] text-gray-400 mb-0.5">שעות שבועיות</span>
          <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
        {employee.hire_date && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[11px] text-gray-400 mb-0.5">תאריך תחילה</span>
            <span className="text-base break-words">{new Date(employee.hire_date).toLocaleDateString("he-IL")}</span>
          </div>
        )}
      </div>

      {/* פעולות – במובייל: תמיד בעמודה, במחשב: שורה */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-2 w-full">
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
