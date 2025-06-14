
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmployeeManagement } from '@/components/modules/employees/EmployeeManagement';

const EmployeeManagementPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-10" dir="rtl">
        <h1 className="text-3xl font-bold mb-4">ניהול עובדים</h1>
        <EmployeeManagement />
      </div>
    </AppLayout>
  );
};

export default EmployeeManagementPage;

