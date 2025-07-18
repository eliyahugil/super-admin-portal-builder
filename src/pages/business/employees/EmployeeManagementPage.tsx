
import React from 'react';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const EmployeeManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container-mobile max-w-7xl mx-auto py-6">
        {/* Employee Management Component - לא מעביר selectedBusinessId כדי שיקח מהקונטקסט */}
        <EmployeeManagement />
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
