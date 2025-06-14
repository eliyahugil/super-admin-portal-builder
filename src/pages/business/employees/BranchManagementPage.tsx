
import React from 'react';

const BranchManagementPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">ניהול סניפים</h1>
      {/* כאן יוצג ניהול (CRUD) לסניפים */}
      <div className="bg-green-50 rounded-lg p-8 text-green-700">
        כאן יתווסף ניהול רשימת סניפים, עריכה, מחיקה ועוד.
      </div>
    </div>
  );
};

export default BranchManagementPage;
