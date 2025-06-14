
import React from 'react';

const EmployeeProfilePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-10" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">פרופיל עובד</h1>
      <div className="bg-gray-50 rounded-lg p-8 text-gray-800">
        כאן יוצגו נתוני הפרופיל, משימות, היסטוריה, הערות וכולי.
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
