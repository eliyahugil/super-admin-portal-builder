
import React from 'react';
import { AttendanceList } from './AttendanceList';

export const AttendanceManagement: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דוח נוכחות עובדים</h1>
        <p className="text-gray-600">מעקב נוכחות עובדים ושעות עבודה</p>
      </div>
      <AttendanceList />
    </div>
  );
};
