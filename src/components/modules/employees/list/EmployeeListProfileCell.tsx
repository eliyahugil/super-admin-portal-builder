
import React from "react";
import { Employee } from "@/types/employee";

interface ProfileCellProps {
  employee: Employee;
}

export const EmployeeListProfileCell: React.FC<ProfileCellProps> = ({ employee }) => (
  <div className="min-w-0 flex-1">
    <div className="font-medium text-right break-words whitespace-normal leading-tight">
      <span className="block text-sm md:text-base font-semibold text-gray-900">
        {`${employee.first_name} ${employee.last_name}`}
      </span>
    </div>
    {employee.email && (
      <div className="text-xs text-gray-500 mt-1 break-words leading-relaxed">{employee.email}</div>
    )}
    {employee.hire_date && (
      <div className="text-xs text-gray-500 break-words mt-0.5">
        התחיל: {new Date(employee.hire_date).toLocaleDateString('he-IL')}
      </div>
    )}
  </div>
);
