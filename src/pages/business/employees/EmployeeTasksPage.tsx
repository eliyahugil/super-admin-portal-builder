
import React from 'react';

const EmployeeTasksPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">משימות/מעקב עובדים</h1>
      <div className="bg-teal-50 rounded-lg p-8 text-teal-700">
        כאן יופיעו טבלת משימות, סטטוסים, תזכורות, שיעורי השלמה.
      </div>
    </div>
  );
};

export default EmployeeTasksPage;
