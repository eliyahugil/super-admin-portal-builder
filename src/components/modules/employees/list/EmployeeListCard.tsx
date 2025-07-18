
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
      className="w-full bg-card border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow animate-fade-in"
      dir="rtl"
    >
      {/* Header: checkbox, name and status */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="mt-1 w-5 h-5 accent-primary border-2 border-border rounded focus:ring-2 focus:ring-primary/20"
            aria-label="בחר עובד"
          />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-foreground break-words leading-tight">
              {`${employee.first_name} ${employee.last_name}`}
            </div>
            {employee.email && (
              <div className="text-sm text-muted-foreground mt-1 break-words">
                {employee.email}
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <EmployeeListStatusCell isActive={!!employee.is_active} />
        </div>
      </div>

      {/* Employee details in grid format for better mobile layout */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Employee ID */}
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">מספר עובד</span>
          <span className="text-sm font-semibold text-foreground">
            {employee.employee_id || (
              <span className="text-muted-foreground font-normal">לא הוגדר</span>
            )}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">טלפון</span>
          <div className="text-sm">
            <EmployeeListPhoneCell employee={employee} />
          </div>
        </div>

        {/* Employee Type */}
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">סוג עובד</span>
          <div className="text-sm">
            <EmployeeListTypeCell type={employee.employee_type} />
          </div>
        </div>

        {/* Branch */}
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">סניף ראשי</span>
          <div className="text-sm">
            <EmployeeListBranchCell employee={employee} />
          </div>
        </div>

        {/* Weekly Hours */}
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">שעות שבועיות</span>
          <div className="text-sm">
            <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
          </div>
        </div>

        {/* Hire Date */}
        {employee.hire_date && (
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-medium text-muted-foreground">תאריך תחילה</span>
            <span className="text-sm font-semibold text-foreground">
              {new Date(employee.hire_date).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-3 border-t border-border">
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
