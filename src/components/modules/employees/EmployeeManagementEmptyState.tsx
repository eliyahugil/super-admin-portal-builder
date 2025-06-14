
import React from 'react';

export const EmployeeManagementEmptyState: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">לא נבחר עסק</h3>
        <p className="text-gray-600">יש לבחור עסק כדי לנהל עובדים</p>
      </div>
    </div>
  );
};
