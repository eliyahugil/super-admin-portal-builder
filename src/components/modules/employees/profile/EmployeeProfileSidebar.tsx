
import React from "react";
import { User } from "lucide-react";
import type { Employee } from "@/types/employee";
import { UsernameField } from "./UsernameField";
import { UserTypeField } from "./UserTypeField";
import { UserStatusBadge } from "./UserStatusBadge";
import { EmployeeDates } from "./EmployeeDates";

interface Props {
  employee: Employee;
}

export const EmployeeProfileSidebar: React.FC<Props> = ({ employee }) => {
  return (
    <aside className="w-full md:w-72 border rounded-lg bg-white p-4 space-y-5 mb-4 md:mb-0 flex-shrink-0" dir="rtl">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700 mb-2">
        <User className="w-4 h-4" />
        הגדרות משתמש
      </h3>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
        <dt className="text-gray-600">שם משתמש</dt>
        <dd><UsernameField username={employee.username} /></dd>

        <dt className="text-gray-600">סוג משתמש</dt>
        <dd><UserTypeField isSystemUser={employee.is_system_user} /></dd>

        <dt className="text-gray-600">סטטוס משתמש</dt>
        <dd><UserStatusBadge isActive={employee.is_active} /></dd>
      </dl>
      <EmployeeDates hire_date={employee.hire_date} termination_date={employee.termination_date} />
    </aside>
  );
};
