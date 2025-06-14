
import React from 'react';
import { ShiftsAdminTable } from '../ShiftsAdminTable';
import { CreateShiftForm } from '../CreateShiftForm';
import { ManagementToolsGridProps } from './types';

export const ManagementToolsGrid: React.FC<ManagementToolsGridProps> = ({
  businessId
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ShiftsAdminTable businessId={businessId} />
      <CreateShiftForm businessId={businessId} />
    </div>
  );
};
