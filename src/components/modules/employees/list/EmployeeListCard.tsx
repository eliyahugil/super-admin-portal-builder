
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
      className="bg-card mx-2 sm:mx-4 my-2 sm:my-3 p-3 sm:p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
      dir="rtl"
    >
      {/* כותרת - שם העובד עם סטטוס */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="w-5 h-5 accent-primary border-2 border-muted-foreground/30 rounded-md"
            aria-label="בחר עובד"
          />
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {`${employee.first_name} ${employee.last_name}`}
            </h3>
            {employee.employee_id && (
              <p className="text-sm text-muted-foreground">
                מס' עובד: {employee.employee_id}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EmployeeListStatusCell isActive={!!employee.is_active} />
          <EmployeeListActionsCell
            employee={employee}
            onDeleteEmployee={onDeleteEmployee}
            onRefetch={onRefetch}
            loading={loading}
          />
        </div>
      </div>

      {/* פרטי קשר */}
      <div className="bg-muted/30 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-3">
            <span className="w-6 text-center">📱</span>
            <div>
              <span className="text-sm font-medium text-muted-foreground">טלפון: </span>
              <EmployeeListPhoneCell employee={employee} />
            </div>
          </div>
          
          {employee.email && (
            <div className="flex items-center gap-3">
              <span className="w-6 text-center">✉️</span>
              <div>
                <span className="text-sm font-medium text-muted-foreground">מייל: </span>
                <span className="text-sm">{employee.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* פרטי עבודה */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">סוג עובד:</span>
          <EmployeeListTypeCell type={employee.employee_type} />
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">סניף:</span>
          <EmployeeListBranchCell employee={employee} />
        </div>
        
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-muted-foreground">שעות שבועיות:</span>
          <EmployeeListWeeklyHoursCell weeklyHoursRequired={employee.weekly_hours_required} />
        </div>
      </div>
    </div>
  );
};
