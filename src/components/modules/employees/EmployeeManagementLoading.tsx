
import React from 'react';

export const EmployeeManagementLoading: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
};
