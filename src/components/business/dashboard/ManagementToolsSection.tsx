
import React from 'react';
import { ShiftsAdminTable } from '@/components/modules/employees/ShiftsAdminTable';
import { CreateShiftForm } from '@/components/modules/employees/CreateShiftForm';

export const ManagementToolsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ShiftsAdminTable />
      <CreateShiftForm />
    </div>
  );
};
