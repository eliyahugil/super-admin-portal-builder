
import React from 'react';
import { Building } from 'lucide-react';

interface BranchAssignment {
  branch: { name: string };
  role_name: string;
  is_active: boolean;
}

interface EmployeeBranchInfoProps {
  mainBranch?: { name: string } | null;
  branchAssignments?: BranchAssignment[];
}

export const EmployeeBranchInfo: React.FC<EmployeeBranchInfoProps> = ({
  mainBranch,
  branchAssignments
}) => {
  const activeBranches = branchAssignments?.filter(ba => ba.is_active) || [];
  
  // If no main branch, show the first active branch assignment as main
  let displayMainBranch = mainBranch;
  if (!displayMainBranch && activeBranches.length > 0) {
    displayMainBranch = { name: activeBranches[0].branch.name };
  }

  return (
    <div className="space-y-1">
      {displayMainBranch && (
        <div className="flex items-center text-sm text-gray-600">
          <Building className="h-3 w-3 mr-1" />
          {displayMainBranch.name}
        </div>
      )}
      {activeBranches.length > 1 && (
        <div className="text-xs text-gray-500">
          +{activeBranches.length - 1} הקצאות פעילות נוספות
        </div>
      )}
      {activeBranches.length === 1 && !mainBranch && (
        <div className="text-xs text-gray-500">
          סניף יחיד
        </div>
      )}
    </div>
  );
};
