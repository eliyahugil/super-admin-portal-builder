
import React from "react";
import { Building } from "lucide-react";
import { Employee } from "@/types/employee";

interface BranchCellProps {
  employee: Employee;
}

export const EmployeeListBranchCell: React.FC<BranchCellProps> = ({ employee }) => (
  employee.main_branch ? (
    <div className="flex items-center gap-2">
      <Building className="h-3 w-3 text-gray-500" />
      <span className="text-sm">{employee.main_branch.name}</span>
    </div>
  ) : (
    <span className="text-gray-400 text-sm">לא שוייך</span>
  )
);
