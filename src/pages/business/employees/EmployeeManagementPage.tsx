
import React from 'react';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';
import { BusinessFilterSelector } from '@/components/modules/employees/BusinessFilterSelector';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useState } from 'react';

const EmployeeManagementPage: React.FC = () => {
  const { isSuperAdmin } = useCurrentBusiness();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  console.log('🎯 EmployeeManagementPage - Super Admin:', isSuperAdmin, 'Selected Business:', selectedBusinessId);

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Business Filter for Super Admin */}
      {isSuperAdmin && (
        <BusinessFilterSelector
          selectedBusinessId={selectedBusinessId}
          onBusinessChange={setSelectedBusinessId}
        />
      )}
      
      {/* Employee Management Component */}
      <EmployeeManagement selectedBusinessId={selectedBusinessId} />
    </div>
  );
};

export default EmployeeManagementPage;
