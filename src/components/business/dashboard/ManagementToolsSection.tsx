
import React from 'react';
import { ShiftsAdminTable } from '@/components/modules/employees/ShiftsAdminTable';
import { CreateShiftFormContainer } from '@/components/modules/employees/CreateShiftForm/CreateShiftFormContainer';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const ManagementToolsSection: React.FC = () => {
  const { businessId } = useCurrentBusiness();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ShiftsAdminTable businessId={businessId} />
      <CreateShiftFormContainer businessId={businessId} />
    </div>
  );
};
