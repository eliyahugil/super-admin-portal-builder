
import React from 'react';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const EmployeeManagementPage: React.FC = () => {
  const { businessId } = useCurrentBusiness();

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Employee Management Component */}
      <EmployeeManagement selectedBusinessId={businessId} />
    </div>
  );
};

export default EmployeeManagementPage;
