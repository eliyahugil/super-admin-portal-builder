
import React from 'react';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const EmployeeManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background w-full" dir="rtl">
      {/* Employee Management Component - לא מעביר selectedBusinessId כדי שיקח מהקונטקסט */}
      <EmployeeManagement />
    </div>
  );
};

export default EmployeeManagementPage;
