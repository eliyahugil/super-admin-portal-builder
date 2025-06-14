
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceList } from '@/components/modules/employees/AttendanceList';

const AttendanceReportPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-10" dir="rtl">
        <h1 className="text-3xl font-bold mb-4">דוח נוכחות עובדים</h1>
        <AttendanceList />
      </div>
    </AppLayout>
  );
};

export default AttendanceReportPage;
