
import React from 'react';
import { ShiftsAdminTable } from '../ShiftsAdminTable';
import { CreateShiftForm } from '../CreateShiftForm';
import { ManagementToolsGridProps } from './types';

export const ManagementToolsGrid: React.FC<ManagementToolsGridProps> = ({
  businessId
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <div className="w-full order-2 md:order-1">
        <ShiftsAdminTable businessId={businessId} />
      </div>
      <div className="w-full order-1 md:order-2">
        <CreateShiftForm businessId={businessId} />
      </div>
    </div>
  );
};

