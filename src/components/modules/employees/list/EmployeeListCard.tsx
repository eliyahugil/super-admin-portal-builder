
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
      className="relative w-full bg-background py-4 px-4 border-b border-border/50 hover:bg-muted/20 transition-all duration-200 active:bg-muted/40"
      dir="rtl"
    >
      {/* Main Content */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="w-5 h-5 accent-primary border-2 border-muted-foreground/20 rounded-md focus:ring-2 focus:ring-primary/20 transition-colors"
            aria-label="בחר עובד"
          />
        </div>

        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          {/* Name & Status Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {`${employee.first_name} ${employee.last_name}`}
              </h3>
              {employee.employee_id && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  מס' עובד: {employee.employee_id}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <EmployeeListStatusCell isActive={!!employee.is_active} />
              <EmployeeListActionsCell
                employee={employee}
                onDeleteEmployee={onDeleteEmployee}
                onRefetch={onRefetch}
                loading={loading}
              />
            </div>
          </div>

          {/* Contact & Type Info */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">📱</span>
                <EmployeeListPhoneCell employee={employee} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">👤</span>
                <EmployeeListTypeCell type={employee.employee_type} />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium min-w-[60px]">סניף:</span>
              <EmployeeListBranchCell employee={employee} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium min-w-[60px]">שעות:</span>
              <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
            </div>
            {employee.email && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium min-w-[60px]">מייל:</span>
                <span className="text-muted-foreground truncate">{employee.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
