
import React from 'react';
import { ShiftsAdminTable } from '@/components/modules/employees/ShiftsAdminTable';
import { CreateShiftFormContainer } from '@/components/modules/employees/CreateShiftForm/CreateShiftFormContainer';

interface ManagementToolsSectionProps {
  selectedBusinessId?: string | null;
  onRefetch?: () => void;
}

export const ManagementToolsSection: React.FC<ManagementToolsSectionProps> = ({ 
  selectedBusinessId,
  onRefetch = () => {}
}) => {
  // Use selectedBusinessId if provided, otherwise the components will use their own business logic
  const businessIdToUse = selectedBusinessId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ShiftsAdminTable businessId={businessIdToUse} />
      <CreateShiftFormContainer businessId={businessIdToUse} />
    </div>
  );
};
