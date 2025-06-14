
import React from "react";
import { Employee } from "@/types/employee";

interface ProfileCellProps {
  employee: Employee;
}

export const EmployeeListProfileCell: React.FC<ProfileCellProps> = ({ employee }) => (
  <div>
    <div>{`${employee.first_name} ${employee.last_name}`}</div>
    {employee.email && (
      <div className="text-xs text-gray-500 mt-1">{employee.email}</div>
    )}
    {employee.hire_date && (
      <div className="text-xs text-gray-500">
        התחיל: {new Date(employee.hire_date).toLocaleDateString('he-IL')}
      </div>
    )}
  </div>
);
