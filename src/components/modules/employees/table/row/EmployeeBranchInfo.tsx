
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

  return (
    <div className="space-y-1">
      {mainBranch && (
        <div className="flex items-center text-sm text-gray-600">
          <Building className="h-3 w-3 mr-1" />
          {mainBranch.name}
        </div>
      )}
      {activeBranches.length > 0 && (
        <div className="text-xs text-gray-500">
          +{activeBranches.length} הקצאות פעילות
        </div>
      )}
    </div>
  );
};
