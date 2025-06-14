
import React from 'react';
import { ShiftsAdminTable } from './ShiftsAdminTable';
import { CreateShiftForm } from './CreateShiftForm';

interface ManagementToolsSectionProps {
  onCreateEmployee: () => void;
  onCreateBranch: () => void;
}

export const ManagementToolsSection: React.FC<ManagementToolsSectionProps> = ({
  onCreateEmployee,
  onCreateBranch
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ShiftsAdminTable />
      <CreateShiftForm />
    </div>
  );
};
