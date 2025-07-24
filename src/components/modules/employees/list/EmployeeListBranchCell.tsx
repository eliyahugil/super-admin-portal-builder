
import React from "react";
import { Building } from "lucide-react";
import { Employee } from "@/types/employee";

interface BranchCellProps {
  employee: Employee;
}

export const EmployeeListBranchCell: React.FC<BranchCellProps> = ({ employee }) => {
  console.log('🏢 EmployeeListBranchCell - Employee data:', {
    employeeName: `${employee.first_name} ${employee.last_name}`,
    mainBranch: employee.main_branch,
    branchAssignments: employee.branch_assignments,
    branchAssignmentsCount: employee.branch_assignments?.length || 0
  });

  // First, try to get the main branch
  let branchName = employee.main_branch?.name;
  
  // If no main branch, get the first active branch assignment
  if (!branchName) {
    const activeBranchAssignment = employee.branch_assignments?.find(ba => ba.is_active);
    branchName = activeBranchAssignment?.branch?.name;
    console.log('🔍 Using active branch assignment:', activeBranchAssignment);
  }
  
  // Fallback to any branch assignment
  if (!branchName && employee.branch_assignments?.[0]?.branch?.name) {
    branchName = employee.branch_assignments[0].branch.name;
    console.log('🔍 Using fallback branch assignment:', employee.branch_assignments[0]);
  }

  console.log('🏢 Final branch name:', branchName);

  return branchName ? (
    <div className="flex items-center gap-2">
      <Building className="h-3 w-3 text-gray-500" />
      <span className="text-sm">{branchName}</span>
    </div>
  ) : (
    <span className="text-gray-400 text-sm">לא שוייך</span>
  );
};
