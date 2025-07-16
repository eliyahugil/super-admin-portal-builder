
import React from 'react';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const EmployeeManagementPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Employee Management Component - לא מעביר selectedBusinessId כדי שיקח מהקונטקסט */}
      <EmployeeManagement />
    </div>
  );
};

export default EmployeeManagementPage;
