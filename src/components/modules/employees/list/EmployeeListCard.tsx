
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
      className="w-full bg-card border-b border-border py-4 px-4 hover:bg-muted/30 transition-colors animate-fade-in active:bg-muted/50"
      dir="rtl"
    >
      {/* Header Row - compact layout */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="w-5 h-5 accent-primary border-2 border-border rounded focus:ring-2 focus:ring-primary/20"
            aria-label="בחר עובד"
          />
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-foreground truncate">
              {`${employee.first_name} ${employee.last_name}`}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {employee.employee_id ? `מס' עובד: ${employee.employee_id}` : 'מס\' עובד: לא הוגדר'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <EmployeeListStatusCell isActive={!!employee.is_active} />
        </div>
      </div>

      {/* Quick Info Row */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Phone */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>📱</span>
            <EmployeeListPhoneCell employee={employee} />
          </div>
          
          {/* Employee Type */}
          <div className="flex items-center gap-1">
            <span>👤</span>
            <EmployeeListTypeCell type={employee.employee_type} />
          </div>
        </div>
        
        {/* Actions - compact */}
        <div className="flex-shrink-0">
          <EmployeeListActionsCell
            employee={employee}
            onDeleteEmployee={onDeleteEmployee}
            onRefetch={onRefetch}
            loading={loading}
          />
        </div>
      </div>

      {/* Additional Info - collapsible */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">סניף:</span> <EmployeeListBranchCell employee={employee} />
        </div>
        <div>
          <span className="font-medium">שעות:</span> <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
        {employee.email && (
          <div className="col-span-2 truncate">
            <span className="font-medium">מייל:</span> {employee.email}
          </div>
        )}
      </div>

    </div>
  );
};
