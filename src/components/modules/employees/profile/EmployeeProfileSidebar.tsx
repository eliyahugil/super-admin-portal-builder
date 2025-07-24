
import React from "react";
import { User } from "lucide-react";
import type { Employee } from "@/types/employee";
import { UsernameField } from "./UsernameField";
import { UserTypeField } from "./UserTypeField";
import { UserStatusBadge } from "./UserStatusBadge";
import { EmployeeDates } from "./EmployeeDates";
import { SendRegistrationTokenButton } from "./SendRegistrationTokenButton";

interface Props {
  employee: Employee;
}

export const EmployeeProfileSidebar: React.FC<Props> = ({ employee }) => {
  return (
    <aside className="w-full border rounded-lg bg-background p-3 sm:p-4 space-y-3 sm:space-y-4 mb-4 xl:mb-0 flex-shrink-0" dir="rtl">
      <h3 className="text-sm sm:text-base lg:text-lg font-semibold flex items-center gap-2 text-foreground mb-2">
        <User className="w-4 h-4 flex-shrink-0" />
        הגדרות משתמש
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-3 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
        <div className="space-y-1 min-w-0">
          <dt className="text-muted-foreground font-medium">שם משתמש</dt>
          <dd className="break-words overflow-hidden">
            <UsernameField username={employee.username} />
          </dd>
        </div>

        <div className="space-y-1 min-w-0">
          <dt className="text-muted-foreground font-medium">סוג משתמש</dt>
          <dd className="break-words overflow-hidden">
            <UserTypeField isSystemUser={employee.is_system_user} />
          </dd>
        </div>

        <div className="space-y-1 min-w-0">
          <dt className="text-muted-foreground font-medium">סטטוס משתמש</dt>
          <dd className="break-words overflow-hidden">
            <UserStatusBadge isActive={employee.is_active} />
          </dd>
        </div>
      </dl>
      
      <div className="min-w-0 overflow-hidden">
        <EmployeeDates 
          hire_date={employee.hire_date} 
          termination_date={employee.termination_date} 
          birth_date={employee.birth_date} 
        />
      </div>
      
      <div className="pt-3 border-t min-w-0">
        <SendRegistrationTokenButton employee={employee} />
      </div>
    </aside>
  );
};
