
import React from 'react';
import { AttendanceList } from '@/components/modules/employees/AttendanceList';

const AttendanceReportPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דוח נוכחות עובדים</h1>
        <p className="text-gray-600">מעקב נוכחות עובדים ושעות עבודה</p>
      </div>
      <AttendanceList />
    </div>
  );
};

export default AttendanceReportPage;
