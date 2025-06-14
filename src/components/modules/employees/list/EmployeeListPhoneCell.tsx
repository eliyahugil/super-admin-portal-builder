
import React from "react";
import { Phone } from "lucide-react";
import { Employee } from "@/types/employee";

interface PhoneCellProps {
  employee: Employee;
}

export const EmployeeListPhoneCell: React.FC<PhoneCellProps> = ({ employee }) => (
  employee.phone ? (
    <div className="flex items-center gap-2">
      <Phone className="h-3 w-3 text-gray-500" />
      <span className="text-sm">{employee.phone}</span>
    </div>
  ) : (
    <span className="text-gray-400 text-sm">לא הוגדר</span>
  )
);
