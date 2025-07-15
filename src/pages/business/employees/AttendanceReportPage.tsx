
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceList } from '@/components/modules/employees/AttendanceList';

const AttendanceReportPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-10" dir="rtl">
        <AttendanceList />
      </div>
    </AppLayout>
  );
};

export default AttendanceReportPage;
