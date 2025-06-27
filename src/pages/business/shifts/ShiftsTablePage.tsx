
import React from 'react';
import { ShiftManagementTable } from '@/components/modules/shifts/ShiftManagementTable';
import { useBusiness } from '@/hooks/useBusiness';

const ShiftsTablePage: React.FC = () => {
  const { businessId } = useBusiness();

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">טבלת משמרות</h1>
        <p className="text-gray-600">ניהול וצפייה במשמרות העובדים במערכת</p>
      </div>

      <ShiftManagementTable businessId={businessId} />
    </div>
  );
};

export default ShiftsTablePage;
